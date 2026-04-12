/**
 * Frontend Form Validation Utilities
 * React-specific validation helpers and hooks
 */

/**
 * Form field validation rules
 */
export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  },

  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    validate: {
      uppercase: (value) =>
        /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
      lowercase: (value) =>
        /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
      number: (value) =>
        /\d/.test(value) || 'Password must contain at least one number',
      special: (value) =>
        /[!@#$%^&*]/.test(value) || 'Password must contain at least one special character (!@#$%^&*)',
    },
  },

  confirmPassword: {
    required: 'Please confirm your password',
  },

  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    maxLength: {
      value: 100,
      message: 'Name must not exceed 100 characters',
    },
  },

  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^\+?[1-9]\d{1,14}$/,
      message: 'Please enter a valid phone number',
    },
  },

  gpa: {
    required: 'GPA is required',
    min: {
      value: 0,
      message: 'GPA cannot be less than 0',
    },
    max: {
      value: 4.0,
      message: 'GPA cannot exceed 4.0',
    },
  },

  countryCode: {
    required: 'Country is required',
  },

  ieltsScore: {
    min: {
      value: 0,
      message: 'IELTS score cannot be less than 0',
    },
    max: {
      value: 9,
      message: 'IELTS score cannot exceed 9',
    },
  },

  toeflScore: {
    min: {
      value: 0,
      message: 'TOEFL score cannot be less than 0',
    },
    max: {
      value: 120,
      message: 'TOEFL score cannot exceed 120',
    },
  },
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/\d/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');

  return {
    isStrong: errors.length === 0,
    requirements: [
      { label: '8+ characters', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Number', met: /\d/.test(password) },
      { label: 'Special character', met: /[!@#$%^&*]/.test(password) },
    ],
    missingRequirements: errors,
  };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const regex = /^\+?[1-9]\d{1,14}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate URL
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate GPA
 */
export const validateGPA = (gpa) => {
  const numGpa = parseFloat(gpa);
  return !isNaN(numGpa) && numGpa >= 0 && numGpa <= 4.0;
};

/**
 * Validate file
 * @param {File} file
 * @param {Object} options
 * @returns {Object} { valid, errors }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10, // MB
    allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  } = options;

  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { valid: false, errors };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSize) {
    errors.push(`File size must not exceed ${maxSize}MB`);
  }

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    fileSizeMB: parseFloat(fileSizeMB.toFixed(2)),
  };
};

/**
 * Sanitize form input (prevent XSS)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validate required fields in form
 */
export const validateRequiredFields = (formData, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Custom validation hook for React forms (for React Hook Form)
 */
export const useFormValidation = (initialErrors = {}) => {
  const [errors, setErrors] = require('react').useState(initialErrors);

  const validateField = (name, value, rule) => {
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const clearError = (name) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    setErrors,
    validateField,
    clearError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0,
  };
};

/**
 * Format error messages for display
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (Array.isArray(error)) return error.join(', ');
  return 'An error occurred';
};

/**
 * Validate application form
 */
export const validateApplicationForm = (formData) => {
  const errors = {};

  if (!formData.universityId) errors.universityId = 'Please select a university';
  if (!formData.programId) errors.programId = 'Please select a program';
  if (!formData.applicationLink) {
    errors.applicationLink = 'Application link is required';
  } else if (!validateUrl(formData.applicationLink)) {
    errors.applicationLink = 'Please enter a valid URL';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate profile form (student)
 */
export const validateProfileForm = (formData) => {
  const errors = {};

  if (!formData.fullName) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (formData.gpa && !validateGPA(formData.gpa)) {
    errors.gpa = 'GPA must be between 0 and 4.0';
  }

  if (formData.ieltsScore && (formData.ieltsScore < 0 || formData.ieltsScore > 9)) {
    errors.ieltsScore = 'IELTS score must be between 0 and 9';
  }

  if (formData.toeflScore && (formData.toeflScore < 0 || formData.toeflScore > 120)) {
    errors.toeflScore = 'TOEFL score must be between 0 and 120';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validationRules,
  validateEmail,
  validatePasswordStrength,
  validatePhone,
  validateUrl,
  validateGPA,
  validateFile,
  sanitizeInput,
  validateRequiredFields,
  useFormValidation,
  formatErrorMessage,
  validateApplicationForm,
  validateProfileForm,
};
