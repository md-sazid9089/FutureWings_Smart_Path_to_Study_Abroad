/**
 * Standardized API Response Helpers
 */

/**
 * Send success response
 * { success: true, data: ... }
 */
function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send error response
 * { success: false, error: { message } }
 */
function errorResponse(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: { message },
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
