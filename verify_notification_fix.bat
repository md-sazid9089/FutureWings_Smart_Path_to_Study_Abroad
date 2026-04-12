@echo off
REM Notification System - Quick Verification Script (Windows)
REM Tests if all components are in place

setlocal enabledelayedexpansion

echo.
echo ====================================================
echo   NOTIFICATION SYSTEM - VERIFICATION SCRIPT
echo ====================================================
echo.

set CHECKS_PASSED=0
set CHECKS_TOTAL=0

REM Helper function to check files
setlocal enabledelayedexpansion

echo Checking Frontend Files...
echo ────────────────────────────

REM Check hook
if exist "frontend\src\hooks\useNotificationPoller.js" (
  echo [+] Found: frontend\src\hooks\useNotificationPoller.js
  set /a CHECKS_PASSED+=1
) else (
  echo [-] Missing: frontend\src\hooks\useNotificationPoller.js
)
set /a CHECKS_TOTAL+=1

REM Check components
if exist "frontend\src\components\NotificationBadge.jsx" (
  echo [+] Found: frontend\src\components\NotificationBadge.jsx
  set /a CHECKS_PASSED+=1
) else (
  echo [-] Missing: frontend\src\components\NotificationBadge.jsx
)
set /a CHECKS_TOTAL+=1

if exist "frontend\src\components\NotificationDropdown.jsx" (
  echo [+] Found: frontend\src\components\NotificationDropdown.jsx
  set /a CHECKS_PASSED+=1
) else (
  echo [-] Missing: frontend\src\components\NotificationDropdown.jsx
)
set /a CHECKS_TOTAL+=1

REM Check GlassNavbar modifications
findstr /M "useNotificationPoller" "frontend\src\components\GlassNavbar.jsx" >nul
if %ERRORLEVEL%==0 (
  echo [+] GlassNavbar has polling hook integrated
  set /a CHECKS_PASSED+=1
) else (
  echo [-] GlassNavbar missing polling hook
)
set /a CHECKS_TOTAL+=1

findstr /M "NotificationBadge" "frontend\src\components\GlassNavbar.jsx" >nul
if %ERRORLEVEL%==0 (
  echo [+] GlassNavbar has NotificationBadge imported
  set /a CHECKS_PASSED+=1
) else (
  echo [-] GlassNavbar missing NotificationBadge
)
set /a CHECKS_TOTAL+=1

findstr /M "NotificationDropdown" "frontend\src\components\GlassNavbar.jsx" >nul
if %ERRORLEVEL%==0 (
  echo [+] GlassNavbar has NotificationDropdown imported
  set /a CHECKS_PASSED+=1
) else (
  echo [-] GlassNavbar missing NotificationDropdown
)
set /a CHECKS_TOTAL+=1

echo.
echo Checking Backend Files...
echo ────────────────────────────

REM Check backend
if exist "backend\src\routes\notifications.js" (
  echo [+] Found: backend\src\routes\notifications.js
  set /a CHECKS_PASSED+=1
) else (
  echo [-] Missing: backend\src\routes\notifications.js
)
set /a CHECKS_TOTAL+=1

REM Check environment
findstr /M "DATABASE_URL" "backend\.env" >nul
if %ERRORLEVEL%==0 (
  echo [+] .env has DATABASE_URL configured
  set /a CHECKS_PASSED+=1
) else (
  echo [-] .env missing DATABASE_URL
)
set /a CHECKS_TOTAL+=1

findstr /M "JWT_SECRET" "backend\.env" >nul
if %ERRORLEVEL%==0 (
  echo [+] .env has JWT_SECRET configured
  set /a CHECKS_PASSED+=1
) else (
  echo [-] .env missing JWT_SECRET
)
set /a CHECKS_TOTAL+=1

echo.
echo ────────────────────────────
echo Summary...
echo ────────────────────────────

if %CHECKS_TOTAL% gtr 0 (
  set /a PERCENTAGE=%CHECKS_PASSED% * 100 / %CHECKS_TOTAL%
  echo Checks Passed: %CHECKS_PASSED%/%CHECKS_TOTAL% (!PERCENTAGE!%%)
) else (
  echo No checks performed
)

echo.

if %CHECKS_PASSED% equ %CHECKS_TOTAL% (
  echo [SUCCESS] All checks passed! System is ready.
  echo.
  echo Next steps:
  echo 1. Start backend: cd backend ^&^& npm start
  echo 2. Start frontend: cd frontend ^&^& npm run dev
  echo 3. Open: http://localhost:3002
  echo 4. Login with: test@futurewings.com / Test@1234
  echo 5. Check browser console for polling logs
  pause
  exit /b 0
) else (
  echo [FAILED] Some checks failed. Please review above.
  pause
  exit /b 1
)
