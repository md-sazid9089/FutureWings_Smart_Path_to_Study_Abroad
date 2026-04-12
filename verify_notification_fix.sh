#!/bin/bash

# Notification System - Quick Verification Script
# Tests if all components are in place

echo "╔══════════════════════════════════════════════════════╗"
echo "║  NOTIFICATION SYSTEM - VERIFICATION SCRIPT          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_TOTAL=0

# Helper function
check_file() {
  ((CHECKS_TOTAL++))
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Found: $1"
    ((CHECKS_PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} Missing: $1"
    return 1
  fi
}

echo "Checking Frontend Files..."
echo "─────────────────────────"

# Check hook
check_file "frontend/src/hooks/useNotificationPoller.js"

# Check components
check_file "frontend/src/components/NotificationBadge.jsx"
check_file "frontend/src/components/NotificationDropdown.jsx"

# Check updated navbar
if grep -q "useNotificationPoller" "frontend/src/components/GlassNavbar.jsx"; then
  ((CHECKS_TOTAL++))
  echo -e "${GREEN}✓${NC} GlassNavbar has polling hook integrated"
  ((CHECKS_PASSED++))
else
  ((CHECKS_TOTAL++))
  echo -e "${RED}✗${NC} GlassNavbar missing polling hook"
fi

if grep -q "NotificationBadge" "frontend/src/components/GlassNavbar.jsx"; then
  ((CHECKS_TOTAL++))
  echo -e "${GREEN}✓${NC} GlassNavbar has NotificationBadge imported"
  ((CHECKS_PASSED++))
else
  ((CHECKS_TOTAL++))
  echo -e "${RED}✗${NC} GlassNavbar missing NotificationBadge"
fi

if grep -q "NotificationDropdown" "frontend/src/components/GlassNavbar.jsx"; then
  ((CHECKS_TOTAL++))
  echo -e "${GREEN}✓${NC} GlassNavbar has NotificationDropdown imported"
  ((CHECKS_PASSED++))
else
  ((CHECKS_TOTAL++))
  echo -e "${RED}✗${NC} GlassNavbar missing NotificationDropdown"
fi

echo ""
echo "Checking Backend Files..."
echo "─────────────────────────"

# Check backend routes
check_file "backend/src/routes/notifications.js"

# Check environment
if grep -q "DATABASE_URL" "backend/.env"; then
  ((CHECKS_TOTAL++))
  echo -e "${GREEN}✓${NC} .env has DATABASE_URL configured"
  ((CHECKS_PASSED++))
else
  ((CHECKS_TOTAL++))
  echo -e "${RED}✗${NC} .env missing DATABASE_URL"
fi

if grep -q "JWT_SECRET" "backend/.env"; then
  ((CHECKS_TOTAL++))
  echo -e "${GREEN}✓${NC} .env has JWT_SECRET configured"
  ((CHECKS_PASSED++))
else
  ((CHECKS_TOTAL++))
  echo -e "${RED}✗${NC} .env missing JWT_SECRET"
fi

echo ""
echo "Summary..."
echo "─────────────────────────"
PERCENTAGE=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))
echo "Checks Passed: $CHECKS_PASSED/$CHECKS_TOTAL ($PERCENTAGE%)"
echo ""

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
  echo -e "${GREEN}✓ All checks passed! System is ready.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start backend: cd backend && npm start"
  echo "2. Start frontend: cd frontend && npm run dev"
  echo "3. Open: http://localhost:3002"
  echo "4. Login with: test@futurewings.com / Test@1234"
  echo "5. Check browser console for polling logs"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please review above.${NC}"
  exit 1
fi
