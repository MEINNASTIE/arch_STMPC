import validationConfig from '../config/validationConfig.json';

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

  // Use general validation config as fallback
  const config = validationConfig.validation[type];
  if (!config) {
    return { isValid: true, message: '' };
  }

  switch (type) {
    case 'text':
      return validateText(value, config);
    case 'number':
      return validateNumber(value, config);
    case 'list':
      return validateList(value, config);
    case 'list_mc':
      return validateMultiChoiceList(value, config);
    case 'password':
      return validatePassword(value, config);
    case 'date':
      return validateDate(value);
    default:
      return { isValid: true, message: '' };
  }
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

    default:
      return { isValid: true, message: '' };
  }
};

/**
 * Validates text input
 * @param {string} value - The text to validate
 * @returns {Object} - Validation result
 */
const validateText = (value, config) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'This field is required' };
  }
  if (value.length < config.min_len) {
    return { isValid: false, message: config.min_len_mess };
  }
  if (value.length > config.max_len) {
    return { isValid: false, message: config.max_len_mess };
  }
  if (!new RegExp(config.regex).test(value)) {
    return { isValid: false, message: config.regex_mess };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates number input
 * @param {string|number} value - The number to validate
 * @returns {Object} - Validation result
 */
const validateNumber = (value, config) => {
  if (!value && value !== 0) {
    return { isValid: false, message: 'This field is required' };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, message: 'Please enter a valid number' };
  }
  if (num < config.min) {
    return { isValid: false, message: config.min_mess };
  }
  if (num > config.max) {
    return { isValid: false, message: config.max_mess };
  }
  if (num % config.step !== 0) {
    return { isValid: false, message: config.step_mess };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates list selection
 * @param {string} value - The selected value
 * @returns {Object} - Validation result
 */
const validateList = (value, config) => {
  if (!value) {
    return { isValid: false, message: 'Please select a value' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates multi-choice list selection
 * @param {Array} values - The selected values
 * @returns {Object} - Validation result
 */
const validateMultiChoiceList = (values, config) => {
  if (!values || values.length === 0) {
    return { isValid: false, message: 'Please select at least one value' };
  }
  if (values.length > config.max_select) {
    return { isValid: false, message: config.max_select_mess };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates password input
 * @param {string} value - The password to validate
 * @returns {Object} - Validation result
 */
const validatePassword = (value, config) => {
  if (!value) {
    return { isValid: false, message: 'Password is required' };
  }
  if (value.length < config.min_len) {
    return { isValid: false, message: config.min_len_mess };
  }
  if (value.length > config.max_len) {
    return { isValid: false, message: config.max_len_mess };
  }
  if (!new RegExp(config.regex).test(value)) {
    return { isValid: false, message: config.regex_mess };
  }
  if (config.forbidden_substrings) {
    const hasForbidden = config.forbidden_substrings.some(substring => 
      value.toLowerCase().includes(substring.toLowerCase())
    );
    if (hasForbidden) {
      return { isValid: false, message: config.forbidden_mess };
    }
  }
  return { isValid: true, message: '' };
};

/**
 * Validates date input
 * @param {string} value - The date to validate
 * @returns {Object} - Validation result
 */
const validateDate = (value) => {
  if (!value) {
    return { isValid: false, message: 'Date is required' };
  }
  
  // Check if the date is in the format DD.MM.YYYY
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  if (!dateRegex.test(value)) {
    return { isValid: false, message: 'Date must be in DD.MM.YYYY format' };
  }

  const [, day, month, year] = value.match(dateRegex);
  const date = new Date(year, month - 1, day);
  
  if (date.getMonth() + 1 !== parseInt(month) || 
      date.getDate() !== parseInt(day) || 
      date.getFullYear() !== parseInt(year)) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  return { isValid: true, message: '' };
}; 