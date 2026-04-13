/**
 * Input Validation Utilities
 * Comprehensive validation functions for common use cases
 */

const { ValidationError } = require('./errors');

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: 8+ chars, uppercase, lowercase, number, special char
 * @param {string} password
 * @returns {Object} { isValid, errors }
 */
function validatePassword(password) {
  const errors = [];

  if (!password) errors.push('Password is required');
  else if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character (!@#$%^&*)');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate phone number (international format)
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate not empty/null
 * @param {any} value
 * @returns {boolean}
 */
function isNotEmpty(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Validate string length
 * @param {string} str
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function isValidLength(str, min = 0, max = 255) {
  if (!str) return false;
  return str.length >= min && str.length <= max;
}

/**
 * Validate file size
 * @param {number} fileSize - Size in bytes
 * @param {number} maxSize - Maximum size in MB
 * @returns {boolean}
 */
function isValidFileSize(fileSize, maxSize = 10) {
  return fileSize <= maxSize * 1024 * 1024;
}

/**
 * Validate file type
 * @param {string} filename
 * @param {Array<string>} allowedTypes - e.g., ['pdf', 'doc', 'docx']
 * @returns {boolean}
 */
function isValidFileType(filename, allowedTypes = []) {
  if (!filename || allowedTypes.length === 0) return false;
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
}

/**
 * Validate CGPA/GPA (0-4.0 scale)
 * @param {number} gpa
 * @returns {boolean}
 */
function isValidGPA(gpa) {
  const numGpa = parseFloat(gpa);
  return !isNaN(numGpa) && numGpa >= 0 && numGpa <= 4.0;
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 * @param {string} code
 * @returns {boolean}
 */
function isValidCountryCode(code) {
  const countryCodes = [
    'US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'NL', 'SG', 'AE', 'CN', 'JP', 'KR', 'SG', 'HK',
    'BD', 'PK', 'LK', 'NP', 'PH', 'MY', 'TH', 'VN', 'ID', 'TW',
    // Add more as needed
  ];
  return countryCodes.includes(code.toUpperCase());
}

/**
 * Validate IELTS/TOEFL scores
 * @param {Object} scores - { type: 'IELTS'|'TOEFL', score: number }
 * @returns {Object} { isValid, errors }
 */
function validateEnglishScore(scores) {
  const errors = [];
  const { type, score } = scores;

  if (!['IELTS', 'TOEFL'].includes(type)) {
    errors.push('Test type must be IELTS or TOEFL');
  }

  if (type === 'IELTS') {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 9) {
      errors.push('IELTS score must be between 0 and 9');
    }
  } else if (type === 'TOEFL') {
    const numScore = parseInt(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 120) {
      errors.push('TOEFL score must be between 0 and 120');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize input string (prevent XSS)
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate pagination parameters
 * @param {number} page
 * @param {number} limit
 * @returns {Object} { page, limit, valid, errors }
 */
function validatePagination(page = 1, limit = 10) {
  const errors = [];
  let validPage = parseInt(page) || 1;
  let validLimit = parseInt(limit) || 10;

  if (validPage < 1) {
    errors.push('Page must be >= 1');
    validPage = 1;
  }

  if (validLimit < 1 || validLimit > 100) {
    errors.push('Limit must be between 1 and 100');
    validLimit = Math.min(Math.max(validLimit, 1), 100);
  }

  return {
    page: validPage,
    limit: validLimit,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate and parse JSON safely
 * @param {string} json
 * @returns {Object} { valid, data, error }
 */
function parseJSON(json) {
  try {
    const data = JSON.parse(json);
    return { valid: true, data, error: null };
  } catch (error) {
    return { valid: false, data: null, error: error.message };
  }
}

/**
 * Validate required fields in object
 * @param {Object} obj
 * @param {Array<string>} requiredFields
 * @returns {Object} { valid, errors }
 */
function validateRequiredFields(obj, requiredFields = []) {
  const errors = {};

  for (const field of requiredFields) {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidUrl,
  isNotEmpty,
  isValidLength,
  isValidFileSize,
  isValidFileType,
  isValidGPA,
  isValidCountryCode,
  validateEnglishScore,
  sanitizeString,
  validatePagination,
  parseJSON,
  validateRequiredFields,
};