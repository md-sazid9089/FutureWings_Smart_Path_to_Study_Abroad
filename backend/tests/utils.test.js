/**
 * Utility Tests
 */
const { successResponse, errorResponse } = require('../src/utils/response');

describe('Utility Response Helpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test('successResponse should return 200 and success status', () => {
    const data = { id: 1 };
    successResponse(mockRes, data);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      data: data
    }));
  });

  test('errorResponse should return 400 and error status by default', () => {
    errorResponse(mockRes, 'Error message');
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      message: 'Error message'
    }));
  });
});
