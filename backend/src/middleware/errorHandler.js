/**
 * Error Handling Middleware
 * Catches and standardizes all errors across the application
 */

const { errorResponse } = require('../utils/response');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Route handler function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware
 * Must be registered after all other middleware and routes
 */
const errorHandler = (err, req, res, next) => {
  // Log error with Winston
  logger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
    code: err.code,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return errorResponse(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.details || null
    );
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401, 'TOKEN_ERROR');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(
      res,
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      err.details || { message: err.message }
    );
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return errorResponse(res, 'Invalid JSON in request body', 400, 'SYNTAX_ERROR');
  }

  // Generic error fallback
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return errorResponse(
    res,
    isDevelopment ? err.message : 'An error occurred',
    statusCode,
    'INTERNAL_ERROR',
    isDevelopment ? { stack: err.stack } : null
  );
};

/**
 * Handle Prisma-specific errors
 * https://www.prisma.io/docs/reference/api-reference/error-reference
 */
function handlePrismaError(err, res) {
  switch (err.code) {
    // Unique constraint violation
    case 'P2002':
      const field = err.meta?.target?.[0] || 'field';
      return errorResponse(
        res,
        `${field} already exists`,
        409,
        'CONFLICT',
        { field }
      );

    // Record not found
    case 'P2025':
      return errorResponse(
        res,
        'Record not found',
        404,
        'NOT_FOUND'
      );

    // Foreign key constraint
    case 'P2003':
      return errorResponse(
        res,
        'Invalid reference to related record',
        400,
        'INVALID_REFERENCE'
      );

    // Invalid data provided to prisma client
    case 'P2009':
      return errorResponse(
        res,
        'Invalid field type or value',
        400,
        'INVALID_DATA'
      );

    // Field not found
    case 'P2012':
      return errorResponse(
        res,
        'Missing required field',
        400,
        'MISSING_FIELD'
      );

    // Too many database connections
    case 'P1011':
      return errorResponse(
        res,
        'Database connection limit reached',
        503,
        'DATABASE_LIMIT'
      );

    // Unknown database connection error
    case 'P1000':
      return errorResponse(
        res,
        'Database connection failed',
        502,
        'DATABASE_CONNECTION_ERROR'
      );

    default:
      return errorResponse(
        res,
        'Database operation failed',
        500,
        'DATABASE_ERROR',
        process.env.NODE_ENV === 'development' ? err : null
      );
  }
}

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    `Cannot ${req.method} ${req.path}`,
    404,
    'ROUTE_NOT_FOUND'
  );
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
};