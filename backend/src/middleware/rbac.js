/**
 * Role-Based Access Control (RBAC) Middleware
 * Manages user roles and permissions across the platform
 */

const { AuthorizationError } = require('../utils/errors');
const { asyncHandler } = require('./errorHandler');

/**
 * User Roles and their permissions
 */
const ROLES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  STUDENT: 'STUDENT',
};

/**
 * Permission matrix defining what each role can do
 */
const PERMISSIONS = {
  // User management
  'user:read_own': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'user:read_all': [ROLES.ADMIN, ROLES.MODERATOR],
  'user:update_own': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'user:update_any': [ROLES.ADMIN],
  'user:delete_any': [ROLES.ADMIN],

  // Application management
  'application:create': [ROLES.ADMIN, ROLES.STUDENT],
  'application:read_own': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'application:read_all': [ROLES.ADMIN, ROLES.MODERATOR],
  'application:update_own': [ROLES.ADMIN, ROLES.STUDENT],
  'application:update_any': [ROLES.ADMIN, ROLES.MODERATOR],
  'application:delete_own': [ROLES.STUDENT],
  'application:delete_any': [ROLES.ADMIN],

  // University management
  'university:create': [ROLES.ADMIN, ROLES.MODERATOR],
  'university:read': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'university:update': [ROLES.ADMIN, ROLES.MODERATOR],
  'university:delete': [ROLES.ADMIN],

  // Document management
  'document:create': [ROLES.ADMIN, ROLES.STUDENT],
  'document:read_own': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'document:read_all': [ROLES.ADMIN, ROLES.MODERATOR],
  'document:update_own': [ROLES.STUDENT],
  'document:update_any': [ROLES.ADMIN],
  'document:delete_own': [ROLES.STUDENT],
  'document:delete_any': [ROLES.ADMIN],

  // Scholarship management
  'scholarship:create': [ROLES.ADMIN, ROLES.MODERATOR],
  'scholarship:read': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'scholarship:update': [ROLES.ADMIN, ROLES.MODERATOR],
  'scholarship:delete': [ROLES.ADMIN],

  // Content moderation
  'content:moderate': [ROLES.ADMIN, ROLES.MODERATOR],
  'content:delete': [ROLES.ADMIN],

  // Rating management
  'rating:create': [ROLES.ADMIN, ROLES.STUDENT],
  'rating:read': [ROLES.ADMIN, ROLES.MODERATOR, ROLES.STUDENT],
  'rating:update_own': [ROLES.STUDENT],
  'rating:delete_own': [ROLES.STUDENT],
  'rating:delete_any': [ROLES.ADMIN],

  // Recommendations
  'recommendation:read': [ROLES.ADMIN, ROLES.STUDENT],
  'recommendation:generate': [ROLES.ADMIN, ROLES.STUDENT],

  // Admin dashboard
  'admin:dashboard': [ROLES.ADMIN, ROLES.MODERATOR],
  'admin:analytics': [ROLES.ADMIN],
  'admin:settings': [ROLES.ADMIN],
};

/**
 * Get all permissions for a role
 * @param {string} role
 * @returns {Array<string>}
 */
function getPermissionsForRole(role) {
  const permissions = [];
  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      permissions.push(permission);
    }
  }
  return permissions;
}

/**
 * Check if a role has a specific permission
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Require authentication middleware
 */
const requireAuth = asyncHandler((req, res, next) => {
  if (!req.user) {
    throw new AuthorizationError('Authentication required');
  }
  next();
});

/**
 * Require specific role(s)
 * @param {...string} allowedRoles
 * @returns {Function}
 */
const requireRole = (...allowedRoles) => {
  return asyncHandler((req, res, next) => {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  });
};

/**
 * Require specific permission
 * @param {string} permission - Permission key
 * @param {Function} ownershipCheck - Optional function to check resource ownership
 * @returns {Function}
 */
const requirePermission = (permission, ownershipCheck = null) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    // Check if user has the permission
    if (!hasPermission(req.user.role, permission)) {
      throw new AuthorizationError('Insufficient permissions for this action');
    }

    // If ownership check is provided, verify resource ownership
    if (ownershipCheck && permission.includes('_own')) {
      const isOwner = await ownershipCheck(req);
      if (!isOwner) {
        throw new AuthorizationError('You can only access your own resources');
      }
    }

    next();
  });
};

/**
 * Check resource ownership (for student-specific resources)
 * Attach to request for later use
 */
const attachUserContext = (req, res, next) => {
  if (req.user) {
    req.userId = req.user.id;
    req.userRole = req.user.role;
  }
  next();
};

/**
 * Middleware to check if user owns a resource
 * @param {string} resourceIdParam - Query/body parameter containing resource ID
 * @param {Function} getResourceOwner - Async function to get resource owner ID
 * @returns {Function}
 */
const isResourceOwner = (resourceIdParam, getResourceOwner) => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

    if (!resourceId) {
      throw new AuthorizationError('Resource ID missing');
    }

    const ownerId = await getResourceOwner(resourceId);

    if (!ownerId || ownerId !== req.user.id) {
      throw new AuthorizationError('You do not own this resource');
    }

    next();
  });
};

/**
 * Middleware for admin-only operations
 */
const adminOnly = requireRole(ROLES.ADMIN);

/**
 * Middleware for moderator and admin operations
 */
const moderatorOrAdmin = requireRole(ROLES.ADMIN, ROLES.MODERATOR);

/**
 * Middleware for authenticated users (any role)
 */
const authenticatedOnly = requireAuth;

module.exports = {
  ROLES,
  PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
  requireAuth,
  requireRole,
  requirePermission,
  attachUserContext,
  isResourceOwner,
  adminOnly,
  moderatorOrAdmin,
  authenticatedOnly,
};