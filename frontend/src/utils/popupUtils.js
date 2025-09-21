// Popup utility functions for consistent popup usage across the application

export const POPUP_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Helper function to create popup state
export const createPopupState = (type, title, message) => ({
  isOpen: true,
  type,
  title,
  message
});

// Common popup messages
export const POPUP_MESSAGES = {
  // Success messages
  APPOINTMENT_BOOKED: {
    type: POPUP_TYPES.SUCCESS,
    title: 'Appointment Booked!',
    message: 'Your appointment has been successfully booked. You will receive a confirmation shortly.'
  },
  LOGIN_SUCCESS: {
    type: POPUP_TYPES.SUCCESS,
    title: 'Login Successful!',
    message: 'Welcome back! You have been successfully logged in.'
  },
  REGISTRATION_SUCCESS: {
    type: POPUP_TYPES.SUCCESS,
    title: 'Registration Successful!',
    message: 'Your account has been created successfully. You can now log in.'
  },
  PROFILE_UPDATED: {
    type: POPUP_TYPES.SUCCESS,
    title: 'Profile Updated!',
    message: 'Your profile information has been updated successfully.'
  },
  PASSWORD_CHANGED: {
    type: POPUP_TYPES.SUCCESS,
    title: 'Password Changed!',
    message: 'Your password has been updated successfully.'
  },

  // Error messages
  GENERAL_ERROR: {
    type: POPUP_TYPES.ERROR,
    title: 'Error',
    message: 'Something went wrong. Please try again.'
  },
  NETWORK_ERROR: {
    type: POPUP_TYPES.ERROR,
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.'
  },
  VALIDATION_ERROR: {
    type: POPUP_TYPES.ERROR,
    title: 'Validation Error',
    message: 'Please check your input and try again.'
  },
  LOGIN_FAILED: {
    type: POPUP_TYPES.ERROR,
    title: 'Login Failed',
    message: 'Invalid email or password. Please try again.'
  },
  REGISTRATION_FAILED: {
    type: POPUP_TYPES.ERROR,
    title: 'Registration Failed',
    message: 'Unable to create your account. Please try again or contact support.'
  },

  // Info messages
  SELECT_TIME_SLOT: {
    type: POPUP_TYPES.INFO,
    title: 'Select Time Slot',
    message: 'Please select a time slot first before booking an appointment.'
  },
  FILL_REQUIRED_FIELDS: {
    type: POPUP_TYPES.INFO,
    title: 'Required Fields',
    message: 'Please fill in all required fields to continue.'
  },
  CONFIRM_ACTION: {
    type: POPUP_TYPES.INFO,
    title: 'Confirm Action',
    message: 'Are you sure you want to perform this action?'
  },

  // Warning messages
  UNSAVED_CHANGES: {
    type: POPUP_TYPES.WARNING,
    title: 'Unsaved Changes',
    message: 'You have unsaved changes. Are you sure you want to leave without saving?'
  },
  DELETE_CONFIRMATION: {
    type: POPUP_TYPES.WARNING,
    title: 'Delete Confirmation',
    message: 'This action cannot be undone. Are you sure you want to delete this item?'
  }
};

// Function to get popup message by key
export const getPopupMessage = (key) => {
  return POPUP_MESSAGES[key] || POPUP_MESSAGES.GENERAL_ERROR;
};

// Function to create custom popup message
export const createCustomPopup = (type, title, message) => {
  return {
    type: type || POPUP_TYPES.INFO,
    title: title || 'Information',
    message: message || 'No message provided'
  };
};

