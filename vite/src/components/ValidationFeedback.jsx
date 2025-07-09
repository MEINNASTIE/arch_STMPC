import React from 'react';
import { Typography } from '@mui/material';

/**
 * Component to display validation feedback messages and hints
 * @param {Object} props - Component props
 * @param {boolean} props.isValid - Whether the input is valid
 * @param {string} props.message - The validation message to display
 * @param {string} props.hint - The hint message to display
 * @param {boolean} props.isTyping - Whether the user is currently typing
 */
const ValidationFeedback = ({ isValid, message, hint, isTyping }) => {
  if (!message && !hint) return null;

  // Show hint when typing and no error message
  if (isTyping && !message && hint) {
    return (
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          display: 'block',
          marginTop: '1px',
          fontSize: '0.65rem',
          fontStyle: 'italic',
        }}
      >
        {hint}
      </Typography>
    );
  }

  // Show validation message if exists
  if (message) {
    return (
      <Typography
        variant="caption"
        sx={{
          color: isValid ? 'success.main' : 'error.main',
          display: 'block',
          marginTop: '1px',
          fontSize: '0.65rem',
        }}
      >
        {message}
      </Typography>
    );
  }

  return null;
};

export default ValidationFeedback; 