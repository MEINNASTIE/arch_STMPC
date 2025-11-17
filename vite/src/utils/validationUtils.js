/**
 * Validates input based on its type and field-specific validation rules
 * @param {any} value - The value to validate
 * @param {string} type - The type of input to validate
 * @param {Object} fieldValidation - Optional field-specific validation rules
 * @returns {Object} - Validation result with isValid and message properties
 */
export const validateInput = (value, type, fieldValidation = null) => {
  // If field has specific validation rules, use those
  if (fieldValidation) {
    return validateWithFieldRules(value, type, fieldValidation);
  }

  // No field-specific rules: consider valid (no default validation)
  return { isValid: true, message: '' };
};

/**
 * Validates input using field-specific validation rules
 * @param {any} value - The value to validate
 * @param {string} type - The type of input
 * @param {Object} rules - Field-specific validation rules
 * @returns {Object} - Validation result
 */
const validateWithFieldRules = (value, type, rules) => {
  if (!value && value !== 0) {
    return { isValid: false, message: 'This field is required' };
  }

  switch (type) {
    case 'text':
      if (rules.min_len !== undefined && value.length < rules.min_len) {
        return { isValid: false, message: rules.min_len_mess || `Minimum length is ${rules.min_len}` };
      }
      if (rules.max_len !== undefined && value.length > rules.max_len) {
        return { isValid: false, message: rules.max_len_mess || `Maximum length is ${rules.max_len}` };
      }
      if (rules.regex && !new RegExp(rules.regex).test(value)) {
        return { isValid: false, message: rules.regex_mess || 'Invalid format' };
      }
      return { isValid: true, message: '' };

    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        return { isValid: false, message: 'Please enter a valid number' };
      }
      if (rules.min !== undefined && num < rules.min) {
        return { isValid: false, message: rules.min_mess || `Minimum value is ${rules.min}` };
      }
      if (rules.max !== undefined && num > rules.max) {
        return { isValid: false, message: rules.max_mess || `Maximum value is ${rules.max}` };
      }
      if (rules.step !== undefined && num % rules.step !== 0) {
        return { isValid: false, message: rules.step_mess || `Value must be a multiple of ${rules.step}` };
      }
      return { isValid: true, message: '' };

    case 'list':
      if (!value) {
        return { isValid: false, message: 'Please select a value' };
      }
      return { isValid: true, message: '' };

    case 'list_mc':
      if (!value || value.length === 0) {
        return { isValid: false, message: 'Please select at least one value' };
      }
      if (rules.max_select && value.length > rules.max_select) {
        return { isValid: false, message: rules.max_select_mess || `Maximum ${rules.max_select} values allowed` };
      }
      return { isValid: true, message: '' };

    case 'password':
      if (rules.min_len !== undefined && value.length < rules.min_len) {
        return { isValid: false, message: rules.min_len_mess || `Password too short` };
      }
      if (rules.max_len !== undefined && value.length > rules.max_len) {
        return { isValid: false, message: rules.max_len_mess || `Password too long` };
      }
      if (rules.regex && !new RegExp(rules.regex).test(value)) {
        return { isValid: false, message: rules.regex_mess || 'Invalid password format' };
      }
      if (rules.forbidden_substrings) {
        const hasForbidden = rules.forbidden_substrings.some(substring => 
          value.toLowerCase().includes(substring.toLowerCase())
        );
        if (hasForbidden) {
          return { isValid: false, message: rules.forbidden_mess || 'Password contains disallowed words or sequences' };
        }
      }
      return { isValid: true, message: '' };

    case 'date':
      // If API provides date rules, apply them; otherwise accept as-is
      if (!value) {
        return { isValid: false, message: 'Date is required' };
      }
      if (rules.regex && !new RegExp(rules.regex).test(value)) {
        return { isValid: false, message: rules.regex_mess || 'Invalid date format' };
      }
      return { isValid: true, message: '' };

    default:
      return { isValid: true, message: '' };
  }
};