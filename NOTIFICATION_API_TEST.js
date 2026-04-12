/**
 * NOTIFICATION SYSTEM - AUTOMATED API TEST SUITE
 * 
 * Purpose: Automated testing of notification system functionality
 * Usage: node NOTIFICATION_API_TEST.js
 * Requirements: Node.js, axios, dotenv
 * 
 * Tests:
 * - Notification Fetching (GET /api/notifications)
 * - Get Unread Count (GET /api/notifications/count)
 * - Mark as Read (POST /api/notifications/:id/read)
 * - Mark All as Read (POST /api/notifications/mark-all/read)
 * - Delete Notification (DELETE /api/notifications/:id)
 * - Create Notification (POST /api/notifications/create)
 * - Clear All (DELETE /api/notifications/clear/all)
 * - Polling Mechanism
 * - Real-time Updates
 */

const axios = require('axios');
require('dotenv').config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = 'test@futurewings.com';
const TEST_USER_PASSWORD = 'Test@1234';
const API_NOTIFICATIONS = `${API_BASE_URL}/api/notifications`;
const API_AUTH = `${API_BASE_URL}/api/auth/login`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const log = {
  pass: (msg) => console.log(`${colors.green}✓ PASS${colors.reset}: ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗ FAIL${colors.reset}: ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ INFO${colors.reset}: ${msg}`),
  test: (msg) => console.log(`\n${colors.cyan}TEST: ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`),
  error: (msg) => console.log(`${colors.red}ERROR${colors.reset}: ${msg}`),
};

// Test result tracking
let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Authenticate test user and get JWT token
 */
async function getAuthToken() {
  try {
    log.info('Authenticating test user...');
    const response = await axios.post(API_AUTH, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (response.status === 200 && response.data.token) {
      log.pass('Authentication successful');
      log.info(`User ID: ${response.data.user.id}`);
      return {
        token: response.data.token,
        userId: response.data.user.id,
      };
    } else {
      log.fail('Authentication failed - unexpected response');
      process.exit(1);
    }
  } catch (error) {
    log.error(`Authentication error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * TEST 1: Fetch Unread Notifications
 */
async function testFetchNotifications(token) {
  log.section('TEST 1: Fetch Unread Notifications');

  try {
    const response = await axios.get(API_NOTIFICATIONS, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: {
        limit: 10,
        offset: 0,
        read: 'unread',
      },
    });

    // Test: Status code is 200
    if (response.status === 200) {
      log.pass('Status code 200 OK');
      testsPassed++;
    } else {
      log.fail(`Unexpected status code: ${response.status}`);
      testsFailed++;
    }

    // Test: Response has required fields
    const { data, total, limit, offset } = response.data.data;
    if (data && Array.isArray(data) && total !== undefined) {
      log.pass('Response structure valid');
      testsPassed++;
    } else {
      log.fail('Response missing required fields');
      testsFailed++;
    }

    // Test: All notifications are unread
    const allUnread = data.every((notif) => notif.read === false);
    if (allUnread) {
      log.pass(`All ${data.length} notifications are unread`);
      testsPassed++;
    } else {
      log.fail('Some notifications marked as read in unread list');
      testsFailed++;
    }

    // Test: Pagination parameters
    if (limit === 10 && offset === 0) {
      log.pass('Pagination parameters correct');
      testsPassed++;
    } else {
      log.fail('Pagination parameters incorrect');
      testsFailed++;
    }

    log.info(`Total unread: ${total} | Displaying: ${data.length}`);
    return data;
  } catch (error) {
    log.fail(`Fetch notifications error: ${error.message}`);
    testsFailed++;
    return [];
  }
}

/**
 * TEST 2: Get Unread Count
 */
async function testGetUnreadCount(token) {
  log.section('TEST 2: Get Unread Count');

  try {
    const response = await axios.get(`${API_NOTIFICATIONS}/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Test: Status code
    if (response.status === 200) {
      log.pass('Status code 200 OK');
      testsPassed++;
    } else {
      log.fail(`Unexpected status code: ${response.status}`);
      testsFailed++;
    }

    // Test: Response has unreadCount
    const { unreadCount } = response.data.data;
    if (unreadCount !== undefined) {
      log.pass(`Unread count retrieved: ${unreadCount}`);
      testsPassed++;
    } else {
      log.fail('Response missing unreadCount');
      testsFailed++;
    }

    // Test: unreadCount is number
    if (typeof unreadCount === 'number' && unreadCount >= 0) {
      log.pass('Unread count is valid number');
      testsPassed++;
    } else {
      log.fail('Unread count is not valid number');
      testsFailed++;
    }

    return unreadCount;
  } catch (error) {
    log.fail(`Get unread count error: ${error.message}`);
    testsFailed++;
    return 0;
  }
}

/**
 * TEST 3: Create Test Notification
 */
async function testCreateNotification() {
  log.section('TEST 3: Create Test Notification');

  const testNotification = {
    userId: 123,  // Change to actual test user ID
    type: 'subscription',
    title: 'Test Notification',
    message: 'This is an automated test notification',
    link: '/profile',
  };

  try {
    const response = await axios.post(
      `${API_NOTIFICATIONS}/create`,
      testNotification
    );

    // Test: Status code 201 (Created)
    if (response.status === 201) {
      log.pass('Status code 201 Created');
      testsPassed++;
    } else {
      log.fail(`Unexpected status code: ${response.status}`);
      testsFailed++;
    }

    // Test: Response has notification ID
    const notificationId = response.data.data?.id;
    if (notificationId) {
      log.pass(`Notification created with ID: ${notificationId}`);
      testsPassed++;
      return notificationId;
    } else {
      log.fail('Response missing notification ID');
      testsFailed++;
      return null;
    }
  } catch (error) {
    log.fail(`Create notification error: ${error.message}`);
    testsFailed++;
    return null;
  }
}

/**
 * TEST 4: Mark Single Notification as Read
 */
async function testMarkAsRead(token, notificationId) {
  if (!notificationId) {
    log.info('Skipping mark as read test (no notification ID)');
    return;
  }

  log.section(`TEST 4: Mark Notification ${notificationId} as Read`);

  try {
    const response = await axios.post(
      `${API_NOTIFICATIONS}/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Test: Status code 200
    if (response.status === 200) {
      log.pass('Status code 200 OK');
      testsPassed++;
    } else {
      log.fail(`Unexpected status code: ${response.status}`);
      testsFailed++;
    }

    // Test: read field is true
    const read = response.data.data?.read;
    if (read === true) {
      log.pass('Notification marked as read');
      testsPassed++;
    } else {
      log.fail('Notification not marked as read');
      testsFailed++;
    }

    // Test: updatedAt timestamp updated
    const updatedAt = response.data.data?.updatedAt;
    if (updatedAt) {
      log.pass(`Timestamp updated: ${updatedAt}`);
      testsPassed++;
    } else {
      log.fail('Timestamp not updated');
      testsFailed++;
    }
  } catch (error) {
    log.fail(`Mark as read error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * TEST 5: Verify Notification Removed from Unread List
 */
async function testNotificationRemovedFromUnread(token, notificationId) {
  if (!notificationId) {
    log.info('Skipping unread list test (no notification ID)');
    return;
  }

  log.section(`TEST 5: Verify Notification Removed from Unread List`);

  try {
    const response = await axios.get(`${API_NOTIFICATIONS}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        read: 'unread',
      },
    });

    const notifications = response.data.data.notifications;
    const found = notifications.find((n) => n.id === notificationId);

    if (!found) {
      log.pass(`Notification ${notificationId} removed from unread list`);
      testsPassed++;
    } else {
      log.fail(`Notification ${notificationId} still in unread list`);
      testsFailed++;
    }
  } catch (error) {
    log.fail(`Unread list test error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * TEST 6: Mark All as Read
 */
async function testMarkAllAsRead(token) {
  log.section('TEST 6: Mark All Notifications as Read');

  try {
    // Get current unread count
    const countBefore = await testGetUnreadCount(token);
    log.info(`Unread before: ${countBefore}`);

    // Mark all as read
    const response = await axios.post(
      `${API_NOTIFICATIONS}/mark-all/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Test: Status code 200
    if (response.status === 200) {
      log.pass('Status code 200 OK');
      testsPassed++;
    } else {
      log.fail(`Unexpected status code: ${response.status}`);
      testsFailed++;
    }

    // Test: Response has count
    const count = response.data.data?.count;
    if (count !== undefined) {
      log.pass(`Marked ${count} notifications as read`);
      testsPassed++;
    } else {
      log.fail('Response missing count');
      testsFailed++;
    }

    // Wait a moment and verify unread count is 0
    await new Promise((r) => setTimeout(r, 500));
    const countAfter = await testGetUnreadCount(token);
    log.info(`Unread after: ${countAfter}`);

    if (countAfter === 0) {
      log.pass('All notifications marked as read verified');
      testsPassed++;
    } else {
      log.fail(`Still have ${countAfter} unread notifications`);
      testsFailed++;
    }
  } catch (error) {
    log.fail(`Mark all as read error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * TEST 7: Delete Notification
 */
async function testDeleteNotification(token, notificationId) {
  if (!notificationId) {
    log.info('Skipping delete test (no notification ID)');
    return;
  }

  log.section(`TEST 7: Delete Notification ${notificationId}`);

  try {
    const response = await axios.delete(
      `${API_NOTIFICATIONS}/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Test: Status code 200
    if (response.status === 200) {
      log.pass('Status code 200 OK');
      testsPassed++;
    } else {
      log.fail(`Unexpected status code: ${response.status}`);
      testsFailed++;
    }

    log.pass(`Notification deleted successfully`);
    testsPassed++;
  } catch (error) {
    // 404 is expected if already deleted
    if (error.response?.status === 404) {
      log.pass('Notification not found (already deleted)');
      testsPassed++;
    } else {
      log.fail(`Delete error: ${error.message}`);
      testsFailed++;
    }
  }
}

/**
 * TEST 8: Test Polling Mechanism
 */
async function testPollingMechanism(token) {
  log.section('TEST 8: Polling Mechanism Simulation');
  log.info('Simulating polling every 5 seconds for 30 seconds...');

  const pollInterval = 5000; // 5 seconds for testing
  let pollCount = 0;
  let successfulPolls = 0;

  return new Promise((resolve) => {
    const startTime = Date.now();
    const maxDuration = 30000; // 30 seconds

    const poll = async () => {
      if (Date.now() - startTime > maxDuration) {
        log.pass(`Polling test completed: ${successfulPolls}/${pollCount} successful`);
        testsPassed++;
        resolve();
        return;
      }

      try {
        pollCount++;
        const response = await axios.get(`${API_NOTIFICATIONS}/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          successfulPolls++;
          log.info(
            `Poll #${pollCount}: ${response.data.data.unreadCount} unread (${Math.round(
              (Date.now() - startTime) / 1000
            )}s)`
          );
        }
      } catch (error) {
        log.fail(`Poll #${pollCount} failed: ${error.message}`);
        testsFailed++;
      }

      setTimeout(poll, pollInterval);
    };

    poll();
  });
}

/**
 * TEST 9: Test Error Handling - 401 Unauthorized
 */
async function testUnauthorizedError() {
  log.section('TEST 9: Error Handling - 401 Unauthorized');

  try {
    await axios.get(API_NOTIFICATIONS, {
      headers: {
        Authorization: 'Bearer invalid_token',
      },
    });
    log.fail('Should have returned 401');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 401) {
      log.pass('401 Unauthorized returned correctly');
      testsPassed++;
    } else {
      log.fail(`Expected 401, got ${error.response?.status}`);
      testsFailed++;
    }
  }
}

/**
 * TEST 10: Test Error Handling - 404 Not Found
 */
async function testNotFoundError(token) {
  log.section('TEST 10: Error Handling - 404 Not Found');

  try {
    await axios.get(`${API_NOTIFICATIONS}/99999`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    log.fail('Should have returned 404');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 404) {
      log.pass('404 Not Found returned correctly');
      testsPassed++;
    } else {
      log.fail(`Expected 404, got ${error.response?.status}`);
      testsFailed++;
    }
  }
}

/**
 * TEST 11: Stress Test - Multiple Rapid Requests
 */
async function testStressMultipleRequests(token) {
  log.section('TEST 11: Stress Test - Multiple Rapid Requests');

  const requestCount = 50;
  const promises = [];

  for (let i = 0; i < requestCount; i++) {
    promises.push(
      axios
        .get(`${API_NOTIFICATIONS}/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .catch((error) => error)
    );
  }

  try {
    const results = await Promise.all(promises);
    const successful =results.filter((r) => r.status === 200).length;

    if (successful === requestCount) {
      log.pass(`All ${requestCount} requests successful`);
      testsPassed++;
    } else {
      log.fail(`Only ${successful}/${requestCount} requests successful`);
      testsFailed++;
    }

    log.info(`Success rate: ${((successful / requestCount) * 100).toFixed(2)}%`);
  } catch (error) {
    log.fail(`Stress test failed: ${error.message}`);
    testsFailed++;
  }
}

/**
 * TEST 12: Response Time Measurement
 */
async function testResponseTime(token) {
  log.section('TEST 12: Response Time Measurement');

  const iterations = 10;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      await axios.get(`${API_NOTIFICATIONS}/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      times.push(Date.now() - start);
    } catch (error) {
      log.fail(`Request ${i + 1} failed`);
      testsFailed++;
    }
  }

  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    log.info(`Average response time: ${avg.toFixed(2)}ms`);
    log.info(`Min response time: ${min}ms`);
    log.info(`Max response time: ${max}ms`);

    if (avg < 200) {
      log.pass('Response time acceptable (< 200ms)');
      testsPassed++;
    } else {
      log.fail(`Response time too slow (${avg.toFixed(2)}ms)`);
      testsFailed++;
    }
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════╗');
  console.log('║  NOTIFICATION SYSTEM - AUTOMATED API TEST SUITE        ║');
  console.log('╚════════════════════════════════════════════════════════╝' + colors.reset);

  log.info(`Backend URL: ${API_BASE_URL}`);
  log.info(`Test User: ${TEST_USER_EMAIL}`);

  // Get authentication token
  const auth = await getAuthToken();
  const token = auth.token;
  const userId = auth.userId;

  // Run test suite
  try {
    // Fetch and analyze current notifications
    const notifications = await testFetchNotifications(token);

    // Get unread count
    const unreadCount = await testGetUnreadCount(token);

    // Create a test notification
    const notificationId = await testCreateNotification();

    // Mark as read
    await testMarkAsRead(token, notificationId);

    // Verify removed from unread
    await testNotificationRemovedFromUnread(token, notificationId);

    // Mark all as read
    await testMarkAllAsRead(token);

    // Delete notification
    await testDeleteNotification(token, notificationId);

    // Error handling tests
    await testUnauthorizedError();
    await testNotFoundError(token);

    // Performance tests
    await testResponseTime(token);
    await testStressMultipleRequests(token);

    // Note: Polling test takes 30 seconds, comment out if too long
    // await testPollingMechanism(token);
  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
  }

  // Print summary
  console.log('\n' + colors.cyan + '━━━ TEST SUMMARY ━━━' + colors.reset);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  const total = testsPassed + testsFailed;
  const percentage = total > 0 ? ((testsPassed / total) * 100).toFixed(2) : 0;
  console.log(`Success Rate: ${percentage}%\n`);

  if (testsFailed === 0) {
    console.log(colors.green + '✓ ALL TESTS PASSED' + colors.reset);
    process.exit(0);
  } else {
    console.log(colors.red + '✗ SOME TESTS FAILED' + colors.reset);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
