/**
 * Pagination Utility
 */

/**
 * Get pagination parameters from query
 * @param {Object} query - Express req.query
 * @param {number} defaultLimit - Default items per page
 * @returns {Object} { skip, take, page, limit }
 */
function getPaginationParams(query, defaultLimit = 10) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}

/**
 * Format paginated response data
 * @param {Array} items - List of items for current page
 * @param {number} total - Total count of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} { items, total, page, totalPages, hasMore }
 */
function formatPaginatedData(items, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedData,
};
