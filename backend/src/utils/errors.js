/**
 * Custom Error Classes
 * Standardized error handling across the application
 */

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 422 Unprocessable Entity
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = {}) {
    super(message, 422, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Authentication Error - 401 Unauthorized
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error - 403 Forbidden
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error - 404
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict Error - 409 (e.g., duplicate email)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Database Error - 500
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * External Service Error - 502/503
 */
class ExternalServiceError extends AppError {
  constructor(service = 'External service', statusCode = 502) {
    super(`${service} is unavailable`, statusCode, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * File Upload Error - 400
 */
class FileUploadError extends AppError {
  constructor(message = 'File upload failed') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  FileUploadError,
};