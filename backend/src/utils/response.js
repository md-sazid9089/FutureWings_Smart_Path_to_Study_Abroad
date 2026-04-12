/**
 * Standardized API Response Helpers
 * Follows consistent response format:
 * {
 *   status: 'success' | 'error',
 *   data: {...},
 *   message: 'Human readable message',
 *   pagination: { page, limit, total, pages } (optional),
 *   error: { code, message, details } (for errors)
 * }
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} pagination - Pagination info (optional)
 */
function successResponse(res, data, message = 'Success', statusCode = 200, pagination = null) {
  const response = {
    status: 'success',
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send paginated success response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function paginatedResponse(res, data, page, limit, total, message = 'Success', statusCode = 200) {
  const pages = Math.ceil(total / limit);
  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };

  return successResponse(res, data, message, statusCode, pagination);
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} code - Error code for client handling
 * @param {Object} details - Additional error details
 */
function errorResponse(res, message, statusCode = 400, code = 'ERROR', details = null) {
  const response = {
    status: 'error',
    message,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 * @param {string} message - Error message
 */
function validationErrorResponse(res, errors, message = 'Validation failed') {
  return res.status(422).json({
    status: 'error',
    message,
    code: 'VALIDATION_ERROR',
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details: errors,
    },
  });
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
};
