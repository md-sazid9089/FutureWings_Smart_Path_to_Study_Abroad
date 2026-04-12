/**
 * API Response Handler Utilities
 * Frontend utilities for handling standardized API responses
 */

import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Parse standardized API response
 * @param {Object} response - Axios response object
 * @returns {Object} { success, data, message, errors }
 */
export const parseApiResponse = (response) => {
  const { data } = response;

  if (!data) {
    return {
      success: false,
      data: null,
      message: 'Empty response from server',
      errors: {},
    };
  }

  if (data.status === 'success') {
    return {
      success: true,
      data: data.data,
      message: data.message || 'Success',
      pagination: data.pagination || null,
    };
  }

  if (data.status === 'error') {
    const errors = data.error?.details || {};
    return {
      success: false,
      data: null,
      message: data.message || 'An error occurred',
      error: data.error?.code,
      errors,
    };
  }

  return {
    success: false,
    data: null,
    message: 'Unexpected response format',
    errors: {},
  };
};

/**
 * Handle API error with standardized structure
 * @param {Error} error - Axios error object
 * @returns {Object} { success, message, errors, status }
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    if (data.status === 'error') {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error?.code,
        errors: data.error?.details || {},
        status,
      };
    }

    // Fallback for non-standardized errors
    return {
      success: false,
      message: data.error?.message || data.message || 'Server error',
      errors: {},
      status,
    };
  }

  if (error.request) {
    // Request made but no response received
    return {
      success: false,
      message: 'No response from server. Please check your connection.',
      errors: {},
      status: 0,
    };
  }

  // Error in request setup
  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
    errors: {},
    status: null,
  };
};

/**
 * Display toast notification based on response
 * @param {Object} response - Parsed API response
 * @param {Object} options - Toast options (title, etc.)
 */
export const showResponseToast = (response, options = {}) => {
  if (response.success) {
    toast.success(response.message || 'Success');
  } else {
    toast.error(response.message || 'An error occurred');
  }
};

/**
 * API request wrapper with error handling
 * @param {Function} apiCall - Async API call function
 * @param {Object} options - Options (showToast, context, etc.)
 * @returns {Promise}
 */
export const apiRequest = async (apiCall, options = {}) => {
  const { showToast = true, context = 'Operation' } = options;

  try {
    const response = await apiCall();
    const parsed = parseApiResponse(response);

    if (showToast && response.status !== 304) {
      showResponseToast(parsed);
    }

    return parsed;
  } catch (error) {
    const errorData = handleApiError(error);

    if (showToast) {
      toast.error(errorData.message);
    }

    return errorData;
  }
};

/**
 * Retry API call with exponential backoff
 * @param {Function} apiCall - API call function
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise}
 */
export const apiCallWithRetry = async (apiCall, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Fetch with pagination support
 * @param {Function} fetchFn - Fetch function that accepts { page, limit }
 * @param {Object} options - Options (initialPage, pageSize)
 * @returns {Promise}
 */
export const fetchPaginatedData = async (fetchFn, options = {}) => {
  const { initialPage = 1, pageSize = 10 } = options;

  try {
    const response = await fetchFn({ page: initialPage, limit: pageSize });
    const parsed = parseApiResponse(response);

    if (parsed.success) {
      return {
        items: parsed.data,
        pagination: parsed.pagination,
        hasMore: parsed.pagination?.hasNextPage || false,
      };
    }

    return {
      items: [],
      pagination: null,
      hasMore: false,
      error: parsed.message,
    };
  } catch (error) {
    const errorData = handleApiError(error);
    return {
      items: [],
      pagination: null,
      hasMore: false,
      error: errorData.message,
    };
  }
};

/**
 * Handle form submission with API call
 * @param {Object} formData - Form data to submit
 * @param {Function} apiCall - API call function
 * @param {Object} callbacks - Success/error callbacks
 * @returns {Promise}
 */
export const handleFormSubmit = async (formData, apiCall, callbacks = {}) => {
  const { onSuccess, onError, showToast = true } = callbacks;

  try {
    const response = await apiCall(formData);
    const parsed = parseApiResponse(response);

    if (parsed.success) {
      if (showToast) {
        toast.success(parsed.message || 'Success');
      }
      onSuccess?.(parsed.data);
      return parsed;
    } else {
      if (showToast) {
        toast.error(parsed.message);
      }
      onError?.(parsed.errors);
      return parsed;
    }
  } catch (error) {
    const errorData = handleApiError(error);
    if (showToast) {
      toast.error(errorData.message);
    }
    onError?.(errorData.errors);
    return errorData;
  }
};

/**
 * Get form error message
 * @param {Object} errors - Errors object
 * @param {string} fieldName - Field name
 * @returns {string | null}
 */
export const getFieldError = (errors, fieldName) => {
  if (typeof errors[fieldName] === 'string') {
    return errors[fieldName];
  }
  if (Array.isArray(errors[fieldName])) {
    return errors[fieldName][0];
  }
  return null;
};

/**
 * Build query string from params
 * @param {Object} params - Query parameters
 * @returns {string}
 */
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

export default {
  parseApiResponse,
  handleApiError,
  showResponseToast,
  apiRequest,
  apiCallWithRetry,
  fetchPaginatedData,
  handleFormSubmit,
  getFieldError,
  buildQueryString,
};
