#!/bin/bash

# ============================================================================
# NOTIFICATION SYSTEM - API ENDPOINT TESTING SCRIPT
# ============================================================================
# Purpose: Automated testing of GET, POST endpoints
# Usage: bash notification_test.sh
# Requirements: curl, jq (for JSON parsing)
# ============================================================================

set -e  # Exit on error

# ============================================================================
# COLOR CODES & OUTPUT FORMATTING
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'  # No Color

print_header() {
  echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  NOTIFICATION SYSTEM - API ENDPOINT TESTING            ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_section() {
  echo -e "\n${BLUE}━━━ $1 ━━━${NC}"
}

print_test() {
  echo -e "${YELLOW}🧪 TEST: $1${NC}"
}

print_pass() {
  echo -e "${GREEN}✓ PASS: $1${NC}"
}

print_fail() {
  echo -e "${RED}✗ FAIL: $1${NC}"
}

print_info() {
  echo -e "${CYAN}ℹ INFO: $1${NC}"
}

# ============================================================================
# CONFIGURATION
# ============================================================================

BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
TEST_EMAIL="test@futurewings.com"
TEST_PASSWORD="Test@1234"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# ============================================================================
# TEST 1: AUTHENTICATION
# ============================================================================

test_authentication() {
  print_section "TEST 1: AUTHENTICATION"
  print_test "Login test user and obtain JWT token"

  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

  # Check if response contains token
  if echo "$RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
    JWT_TOKEN=$(echo "$RESPONSE" | jq -r '.token')
    USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
    print_pass "Authentication successful"
    print_info "User ID: $USER_ID"
    print_info "Token obtained (length: ${#JWT_TOKEN})"
    ((TESTS_PASSED++))
  else
    print_fail "Authentication failed"
    print_info "Response: $RESPONSE"
    ((TESTS_FAILED++))
    exit 1
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 2: GET /api/notifications
# ============================================================================

test_get_notifications() {
  print_section "TEST 2: GET /api/notifications"
  print_test "Fetch unread notifications"

  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications?limit=10&offset=0&read=unread" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json")

  # Check response status
  if echo "$RESPONSE" | jq -e '.data.notifications' > /dev/null 2>&1; then
    NOTIF_COUNT=$(echo "$RESPONSE" | jq '.data.total')
    print_pass "GET /api/notifications returned data"
    print_info "Total unread notifications: $NOTIF_COUNT"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))

    # Verify response structure
    if echo "$RESPONSE" | jq -e '.data | has("notifications") and has("total") and has("limit") and has("offset")' > /dev/null 2>&1; then
      print_pass "Response structure valid"
      ((TESTS_PASSED++))
    else
      print_fail "Response structure incomplete"
      ((TESTS_FAILED++))
    fi
    ((TESTS_TOTAL++))

    # Check if notifications have required fields
    if [ "$NOTIF_COUNT" -gt 0 ]; then
      FIRST_NOTIF=$(echo "$RESPONSE" | jq '.data.notifications[0]')
      if echo "$FIRST_NOTIF" | jq -e '. | has("id") and has("title") and has("message") and has("read") and has("createdAt")' > /dev/null 2>&1; then
        print_pass "Notification fields present"
        FIRST_ID=$(echo "$FIRST_NOTIF" | jq '.id')
        print_info "First notification ID: $FIRST_ID"
        ((TESTS_PASSED++))
      else
        print_fail "Required fields missing from notification"
        ((TESTS_FAILED++))
      fi
      ((TESTS_TOTAL++))
    fi

  else
    print_fail "GET /api/notifications failed"
    print_info "Response: $RESPONSE"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
    return 1
  fi
}

# ============================================================================
# TEST 3: POST /api/notifications/:id/read
# ============================================================================

test_mark_as_read() {
  print_section "TEST 3: POST /api/notifications/:id/read"
  print_test "Mark notification as read"

  # First, get an unread notification
  GET_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications?limit=1&read=unread" \
    -H "Authorization: Bearer ${JWT_TOKEN}")

  NOTIF_ID=$(echo "$GET_RESPONSE" | jq -r '.data.notifications[0].id' 2>/dev/null)

  if [ -z "$NOTIF_ID" ] || [ "$NOTIF_ID" = "null" ]; then
    print_fail "No unread notifications found for testing"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
    return 1
  fi

  print_info "Using notification ID: $NOTIF_ID"

  # Mark as read
  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/notifications/${NOTIF_ID}/read" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json")

  # Check response
  if echo "$RESPONSE" | jq -e '.data.read' > /dev/null 2>&1; then
    READ_STATUS=$(echo "$RESPONSE" | jq '.data.read')
    if [ "$READ_STATUS" = "true" ]; then
      print_pass "Notification marked as read in API response"
      ((TESTS_PASSED++))
    else
      print_fail "Read status not true: $READ_STATUS"
      ((TESTS_FAILED++))
    fi
  else
    print_fail "POST /api/notifications/:id/read failed"
    print_info "Response: $RESPONSE"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))

  # Verify timestamp updated
  if echo "$RESPONSE" | jq -e '.data.updatedAt' > /dev/null 2>&1; then
    print_pass "UpdatedAt timestamp present"
    ((TESTS_PASSED++))
  else
    print_fail "UpdatedAt timestamp missing"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 4: GET /api/notifications/count
# ============================================================================

test_unread_count() {
  print_section "TEST 4: GET /api/notifications/count"
  print_test "Get unread notification count"

  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications/count" \
    -H "Authorization: Bearer ${JWT_TOKEN}")

  if echo "$RESPONSE" | jq -e '.data.unreadCount' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq '.data.unreadCount')
    print_pass "Unread count retrieved: $COUNT"
    ((TESTS_PASSED++))
  else
    print_fail "GET /api/notifications/count failed"
    print_info "Response: $RESPONSE"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 5: POST /api/notifications/mark-all/read
# ============================================================================

test_mark_all_read() {
  print_section "TEST 5: POST /api/notifications/mark-all/read"
  print_test "Mark all notifications as read"

  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/notifications/mark-all/read" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{}')

  if echo "$RESPONSE" | jq -e '.data.count' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq '.data.count')
    print_pass "Marked $COUNT notifications as read"
    ((TESTS_PASSED++))
  else
    print_fail "POST /api/notifications/mark-all/read failed"
    print_info "Response: $RESPONSE"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))

  # Verify unread count is now 0
  echo -n "  Verifying unread count = 0... "
  COUNT_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications/count" \
    -H "Authorization: Bearer ${JWT_TOKEN}")

  NEW_COUNT=$(echo "$COUNT_RESPONSE" | jq '.data.unreadCount')
  if [ "$NEW_COUNT" = "0" ]; then
    print_pass "Unread count is 0"
    ((TESTS_PASSED++))
  else
    print_fail "Unread count is $NEW_COUNT (expected 0)"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 6: ERROR HANDLING - Invalid Notification ID
# ============================================================================

test_error_invalid_id() {
  print_section "TEST 6: ERROR HANDLING - Invalid Notification ID"
  print_test "Mark non-existent notification as read (should return 404)"

  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/notifications/99999/read" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json")

  if echo "$RESPONSE" | jq -e '.statusCode' > /dev/null 2>&1; then
    STATUS=$(echo "$RESPONSE" | jq '.statusCode')
    if [ "$STATUS" = "404" ] || [ "$STATUS" = "400" ]; then
      print_pass "Error handled correctly (Status: $STATUS)"
      ((TESTS_PASSED++))
    else
      print_fail "Unexpected status code: $STATUS"
      ((TESTS_FAILED++))
    fi
  else
    print_fail "Error response format invalid"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 7: ERROR HANDLING - Missing Authentication
# ============================================================================

test_error_no_auth() {
  print_section "TEST 7: ERROR HANDLING - Missing Authentication"
  print_test "GET without Authorization header (should return 401)"

  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications" \
    -H "Content-Type: application/json")

  if echo "$RESPONSE" | jq -e '.statusCode' > /dev/null 2>&1; then
    STATUS=$(echo "$RESPONSE" | jq '.statusCode')
    if [ "$STATUS" = "401" ]; then
      print_pass "401 Unauthorized returned correctly"
      ((TESTS_PASSED++))
    else
      print_fail "Expected 401, got: $STATUS"
      ((TESTS_FAILED++))
    fi
  else
    print_fail "Error response format invalid"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 8: ERROR HANDLING - Invalid Token
# ============================================================================

test_error_invalid_token() {
  print_section "TEST 8: ERROR HANDLING - Invalid JWT Token"
  print_test "GET with invalid token (should return 401)"

  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications" \
    -H "Authorization: Bearer invalid_token_xyz" \
    -H "Content-Type: application/json")

  if echo "$RESPONSE" | jq -e '.statusCode' > /dev/null 2>&1; then
    STATUS=$(echo "$RESPONSE" | jq '.statusCode')
    if [ "$STATUS" = "401" ]; then
      print_pass "Invalid token rejected with 401"
      ((TESTS_PASSED++))
    else
      print_fail "Expected 401, got: $STATUS"
      ((TESTS_FAILED++))
    fi
  else
    print_fail "Error response format invalid"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 9: RESPONSE TIME
# ============================================================================

test_response_time() {
  print_section "TEST 9: PERFORMANCE - Response Time"
  print_test "Measure GET /api/notifications response time"

  START=$(date +%s%N)
  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications?limit=5" \
    -H "Authorization: Bearer ${JWT_TOKEN}")
  END=$(date +%s%N)

  ELAPSED_MS=$(( (END - START) / 1000000 ))

  if [ "$ELAPSED_MS" -lt 200 ]; then
    print_pass "Response time acceptable: ${ELAPSED_MS}ms (< 200ms)"
    ((TESTS_PASSED++))
  else
    print_fail "Response time slow: ${ELAPSED_MS}ms (expected < 200ms)"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 10: Pagination
# ============================================================================

test_pagination() {
  print_section "TEST 10: PAGINATION"
  print_test "Test pagination with limit and offset"

  # Get with limit=5
  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/notifications?limit=5&offset=0" \
    -H "Authorization: Bearer ${JWT_TOKEN}")

  if echo "$RESPONSE" | jq -e '.data | .notifications[] | .id' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq '.data.notifications | length')
    if [ "$COUNT" -le 5 ]; then
      print_pass "Pagination limit respected: $COUNT <= 5"
      ((TESTS_PASSED++))
    else
      print_fail "Pagination limit not respected: $COUNT > 5"
      ((TESTS_FAILED++))
    fi
  else
    print_fail "Pagination test failed"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 11: Create Notification
# ============================================================================

test_create_notification() {
  print_section "TEST 11: POST /api/notifications/create"
  print_test "Create a test notification"

  RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/notifications/create" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": ${USER_ID},
      \"type\": \"subscription\",
      \"title\": \"Test Notification\",
      \"message\": \"This is a test notification\",
      \"link\": \"/profile\"
    }")

  if echo "$RESPONSE" | jq -e '.data.id' > /dev/null 2>&1; then
    NEW_ID=$(echo "$RESPONSE" | jq '.data.id')
    print_pass "Notification created with ID: $NEW_ID"
    ((TESTS_PASSED++))
  else
    print_fail "Failed to create notification"
    ((TESTS_FAILED++))
  fi
  ((TESTS_TOTAL++))
}

# ============================================================================
# TEST 12: Server Availability
# ============================================================================

test_server_availability() {
  print_section "TEST 12: SERVER AVAILABILITY"
  print_test "Check backend health endpoint"

  RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/health" 2>/dev/null)

  if [ -z "$RESPONSE" ]; then
    print_fail "Backend server not responding"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
    exit 1
  else
    print_pass "Backend server is responding"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
  fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  print_header

  print_info "Backend URL: $BACKEND_URL"
  print_info "Test User: $TEST_EMAIL"
  echo ""

  # Run all tests
  test_server_availability
  test_authentication
  test_get_notifications
  test_unread_count
  test_mark_as_read
  test_mark_all_read
  test_error_invalid_id
  test_error_no_auth
  test_error_invalid_token
  test_response_time
  test_pagination
  test_create_notification

  # Print summary
  print_section "TEST SUMMARY"
  echo -e "Total Tests: ${CYAN}${TESTS_TOTAL}${NC}"
  echo -e "Passed: ${GREEN}${TESTS_PASSED}${NC}"
  echo -e "Failed: ${RED}${TESTS_FAILED}${NC}"

  if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))
    echo -e "Success Rate: ${CYAN}${SUCCESS_RATE}%${NC}"
  fi

  echo ""

  # Final status
  if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    exit 0
  else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
  fi
}

# Run main function
main "$@"
