/**
 * Jest Test Setup
 * Initialization and mocking for tests
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};

// Global timeout for all tests
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Disconnect database if needed
  // await prisma.$disconnect();
});
