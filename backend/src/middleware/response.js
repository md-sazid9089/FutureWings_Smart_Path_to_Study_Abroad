/**
 * Response Utilities
 * 
 * Standardized API response format for all endpoints
 */

const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    error: null,
  });
};

const sendError = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    data: null,
    error: { message },
  });
};

module.exports = { sendSuccess, sendError };
