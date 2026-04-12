/**
 * Test Utilities and Helpers
 * Helper functions for testing API endpoints
 */

const request = require('supertest');

/**
 * Create test API client
 * @param {Express.app} app - Express app instance
 * @returns {Object}
 */
function createTestClient(app) {
  return {
    /**
     * POST request
     */
    post: (path, data = {}, token = null) => {
      let req = request(app).post(path).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    /**
     * GET request
     */
    get: (path, token = null) => {
      let req = request(app).get(path);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    /**
     * PUT request
     */
    put: (path, data = {}, token = null) => {
      let req = request(app).put(path).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    /**
     * PATCH request
     */
    patch: (path, data = {}, token = null) => {
      let req = request(app).patch(path).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    /**
     * DELETE request
     */
    delete: (path, token = null) => {
      let req = request(app).delete(path);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
  };
}

/**
 * Mock user for testing
 */
const mockUsers = {
  admin: {
    id: 'admin-001',
    email: 'admin@test.com',
    fullName: 'Admin User',
    role: 'ADMIN',
  },
  student: {
    id: 'student-001',
    email: 'student@test.com',
    fullName: 'Student User',
    role: 'STUDENT',
  },
  moderator: {
    id: 'moderator-001',
    email: 'moderator@test.com',
    fullName: 'Moderator User',
    role: 'MODERATOR',
  },
};

/**
 * Generate fake JWT token for testing
 * @param {Object} payload
 * @returns {string}
 */
function generateTestToken(payload = {}) {
  // Simple base64 encoding for testing (not secure, just for tests)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = Buffer.from('test-signature').toString('base64');
  return `${header}.${body}.${signature}`;
}

/**
 * Assert response structure
 */
function assertSuccessResponse(response) {
  expect(response.body).toHaveProperty('status');
  expect(response.body.status).toBe('success');
  expect(response.body).toHaveProperty('message');
  expect(response.body).toHaveProperty('data');
}

/**
 * Assert error response structure
 */
function assertErrorResponse(response) {
  expect(response.body).toHaveProperty('status');
  expect(response.body.status).toBe('error');
  expect(response.body).toHaveProperty('message');
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toHaveProperty('code');
}

/**
 * Assert pagination response structure
 */
function assertPaginatedResponse(response) {
  assertSuccessResponse(response);
  expect(response.body).toHaveProperty('pagination');
  expect(response.body.pagination).toHaveProperty('page');
  expect(response.body.pagination).toHaveProperty('limit');
  expect(response.body.pagination).toHaveProperty('total');
  expect(response.body.pagination).toHaveProperty('pages');
}

/**
 * Mock Prisma responses
 */
const mockPrismaUser = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'STUDENT',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaApplication = {
  id: 'app-123',
  userId: 'user-123',
  universityId: 'uni-123',
  programId: 'prog-123',
  status: 'PENDING',
  appliedDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

module.exports = {
  createTestClient,
  mockUsers,
  generateTestToken,
  assertSuccessResponse,
  assertErrorResponse,
  assertPaginatedResponse,
  mockPrismaUser,
  mockPrismaApplication,
};
