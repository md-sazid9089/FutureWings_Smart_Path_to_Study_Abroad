/**
 * Validation Utilities Tests
 */

const {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidUrl,
  isValidGPA,
  isValidCountryCode,
  validateEnglishScore,
  sanitizeString,
  validatePagination,
  validateRequiredFields,
  isValidFileSize,
  isValidFileType,
} = require('../src/utils/validation');

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    test('should validate correct email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@subdomain.co.uk')).toBe(true);
    });

    test('should reject invalid email format', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong password', () => {
      const result = validatePassword('SecurePass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should require uppercase, lowercase, number, special char', () => {
      const result = validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase letter');
    });
  });

  describe('Phone Validation', () => {
    test('should validate international phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('URL Validation', () => {
    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://sub.example.co.uk')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ht!tp://invalid')).toBe(false);
    });
  });

  describe('GPA Validation', () => {
    test('should validate GPA between 0-4.0', () => {
      expect(isValidGPA(3.5)).toBe(true);
      expect(isValidGPA(4.0)).toBe(true);
      expect(isValidGPA(0)).toBe(true);
    });

    test('should reject GPA outside range', () => {
      expect(isValidGPA(4.5)).toBe(false);
      expect(isValidGPA(-1)).toBe(false);
    });
  });

  describe('Country Code Validation', () => {
    test('should validate ISO country codes', () => {
      expect(isValidCountryCode('US')).toBe(true);
      expect(isValidCountryCode('GB')).toBe(true);
      expect(isValidCountryCode('IN')).toBe(true);
    });

    test('should reject invalid country codes', () => {
      expect(isValidCountryCode('XX')).toBe(false);
      expect(isValidCountryCode('INVALID')).toBe(false);
    });
  });

  describe('English Score Validation', () => {
    test('should validate IELTS scores', () => {
      const result = validateEnglishScore({ type: 'IELTS', score: 6.5 });
      expect(result.isValid).toBe(true);
    });

    test('should validate TOEFL scores', () => {
      const result = validateEnglishScore({ type: 'TOEFL', score: 100 });
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid scores', () => {
      const result = validateEnglishScore({ type: 'IELTS', score: 10 });
      expect(result.isValid).toBe(false);
    });
  });

  describe('String Sanitization', () => {
    test('should sanitize HTML/XSS attempts', () => {
      const xss = '<script>alert("xss")</script>';
      const sanitized = sanitizeString(xss);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    test('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });
  });

  describe('Pagination Validation', () => {
    test('should validate valid pagination params', () => {
      const result = validatePagination(1, 10);
      expect(result.valid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should correct invalid pagination params', () => {
      const result = validatePagination(0, 200);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });
  });

  describe('Required Fields Validation', () => {
    test('should validate all required fields present', () => {
      const obj = { email: 'test@example.com', password: 'SecurePass123!' };
      const result = validateRequiredFields(obj, ['email', 'password']);
      expect(result.valid).toBe(true);
    });

    test('should catch missing required fields', () => {
      const obj = { email: 'test@example.com' };
      const result = validateRequiredFields(obj, ['email', 'password']);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty('password');
    });
  });

  describe('File Validation', () => {
    test('should validate file size', () => {
      expect(isValidFileSize(5 * 1024 * 1024, 10)).toBe(true); // 5MB < 10MB
      expect(isValidFileSize(15 * 1024 * 1024, 10)).toBe(false); // 15MB > 10MB
    });

    test('should validate file type', () => {
      expect(isValidFileType('document.pdf', ['pdf', 'doc'])).toBe(true);
      expect(isValidFileType('image.jpg', ['pdf', 'doc'])).toBe(false);
    });
  });
});
