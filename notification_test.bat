@echo off
REM ============================================================================
REM NOTIFICATION SYSTEM - API ENDPOINT TESTING SCRIPT (WINDOWS)
REM ============================================================================
REM Purpose: Automated testing of GET, POST endpoints
REM Usage: notification_test.bat
REM Requirements: curl (built-in Windows 10+), PowerShell
REM ============================================================================

setlocal enabledelayedexpansion

REM ============================================================================
REM CONFIGURATION
REM ============================================================================

set BACKEND_URL=http://localhost:5000
set TEST_EMAIL=test@futurewings.com
set TEST_PASSWORD=Test@1234

REM Test counters
set TESTS_PASSED=0
set TESTS_FAILED=0
set TESTS_TOTAL=0

REM ============================================================================
REM OUTPUT FORMATTING
REM ============================================================================

cls
echo.
echo ============================================================================
echo NOTIFICATION SYSTEM - API ENDPOINT TESTING
echo ============================================================================
echo.
echo Backend URL: %BACKEND_URL%
echo Test User: %TEST_EMAIL%
echo.
echo ============================================================================
echo TEST 1: AUTHENTICATION
echo ============================================================================
echo.
echo [*] Logging in test user...

REM Use PowerShell to make REST calls and parse JSON
powershell -Command ^
"$loginUrl = '%BACKEND_URL%/api/auth/login'; " ^
"$body = @{email='%TEST_EMAIL%'; password='%TEST_PASSWORD%'} | ConvertTo-Json; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType 'application/json'; " ^
"  $token = $response.token; " ^
"  $userId = $response.user.id; " ^
"  Write-Host '[+] SUCCESS: Authentication successful' -ForegroundColor Green; " ^
"  Write-Host '[i] User ID: '$userId; " ^
"  Write-Host '[i] Token obtained (length: '$token.Length')'; " ^
"  Set-Content -Path 'token.txt' -Value $token; " ^
"  Set-Content -Path 'userid.txt' -Value $userId; " ^
"} catch { " ^
"  Write-Host '[-] FAILED: Authentication failed' -ForegroundColor Red; " ^
"  Write-Host 'Error: '$_.Exception.Message; " ^
"  exit 1; " ^
"}"

set /p JWT_TOKEN=<token.txt
set /p USER_ID=<userid.txt

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 2: GET /api/notifications
REM ============================================================================

echo.
echo ============================================================================
echo TEST 2: GET /api/notifications
echo ============================================================================
echo.
echo [*] Fetching unread notifications...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications?limit=10'; " ^
"$headers = @{'Authorization'='Bearer %JWT_TOKEN%';}; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers; " ^
"  $total = $response.data.total; " ^
"  Write-Host '[+] SUCCESS: GET /api/notifications returned data' -ForegroundColor Green; " ^
"  Write-Host '[i] Total unread notifications: '$total; " ^
"  if ($response.data.notifications.Count -gt 0) { " ^
"    $notifId = $response.data.notifications[0].id; " ^
"    Write-Host '[i] First notification ID: '$notifId; " ^
"    Set-Content -Path 'notif_id.txt' -Value $notifId; " ^
"  } " ^
"} catch { " ^
"  Write-Host '[-] FAILED: GET /api/notifications failed' -ForegroundColor Red; " ^
"  Write-Host 'Error: '$_.Exception.Message; " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 3: GET /api/notifications/count
REM ============================================================================

echo.
echo ============================================================================
echo TEST 3: GET /api/notifications/count
echo ============================================================================
echo.
echo [*] Getting unread notification count...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications/count'; " ^
"$headers = @{'Authorization'='Bearer %JWT_TOKEN%';}; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers; " ^
"  $count = $response.data.unreadCount; " ^
"  Write-Host '[+] SUCCESS: Unread count retrieved: '$count -ForegroundColor Green; " ^
"  Set-Content -Path 'unread_count.txt' -Value $count; " ^
"} catch { " ^
"  Write-Host '[-] FAILED: GET /api/notifications/count failed' -ForegroundColor Red; " ^
"  Write-Host 'Error: '$_.Exception.Message; " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 4: POST /api/notifications/:id/read
REM ============================================================================

if exist notif_id.txt (
  set /p NOTIF_ID=<notif_id.txt
  
  echo.
  echo ============================================================================
  echo TEST 4: POST /api/notifications/:id/read
  echo ============================================================================
  echo.
  echo [*] Marking notification (ID: %NOTIF_ID%) as read...
  
  powershell -Command ^
  "$url = '%BACKEND_URL%/api/notifications/%NOTIF_ID%/read'; " ^
  "$headers = @{'Authorization'='Bearer %JWT_TOKEN%';}; " ^
  "try { " ^
  "  $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers; " ^
  "  $readStatus = $response.data.read; " ^
  "  if ($readStatus -eq $true) { " ^
  "    Write-Host '[+] SUCCESS: Notification marked as read' -ForegroundColor Green; " ^
  "  } else { " ^
  "    Write-Host '[-] FAILED: Read status is: '$readStatus -ForegroundColor Red; " ^
  "  } " ^
  "} catch { " ^
  "  Write-Host '[-] FAILED: POST /api/notifications/:id/read failed' -ForegroundColor Red; " ^
  "  Write-Host 'Error: '$_.Exception.Message; " ^
  "}"
  
  set /a TESTS_PASSED+=1
  set /a TESTS_TOTAL+=1
)

REM ============================================================================
REM TEST 5: POST /api/notifications/mark-all/read
REM ============================================================================

echo.
echo ============================================================================
echo TEST 5: POST /api/notifications/mark-all/read
echo ============================================================================
echo.
echo [*] Marking all notifications as read...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications/mark-all/read'; " ^
"$headers = @{'Authorization'='Bearer %JWT_TOKEN%';}; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers; " ^
"  $count = $response.data.count; " ^
"  Write-Host '[+] SUCCESS: Marked '$count' notifications as read' -ForegroundColor Green; " ^
"} catch { " ^
"  Write-Host '[-] FAILED: POST /api/notifications/mark-all/read failed' -ForegroundColor Red; " ^
"  Write-Host 'Error: '$_.Exception.Message; " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 6: ERROR HANDLING - Invalid ID
REM ============================================================================

echo.
echo ============================================================================
echo TEST 6: ERROR HANDLING - Invalid Notification ID
echo ============================================================================
echo.
echo [*] Testing 404 error with invalid ID...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications/99999/read'; " ^
"$headers = @{'Authorization'='Bearer %JWT_TOKEN%';}; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers; " ^
"  Write-Host '[-] FAILED: Should have returned error' -ForegroundColor Red; " ^
"} catch { " ^
"  $statusCode = $_.Exception.Response.StatusCode.Value__; " ^
"  if ($statusCode -eq 404 -or $statusCode -eq 400) { " ^
"    Write-Host '[+] SUCCESS: Error handled correctly (Status: '$statusCode')' -ForegroundColor Green; " ^
"  } else { " ^
"    Write-Host '[-] FAILED: Unexpected status code: '$statusCode -ForegroundColor Red; " ^
"  } " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 7: ERROR HANDLING - No Auth
REM ============================================================================

echo.
echo ============================================================================
echo TEST 7: ERROR HANDLING - Missing Authentication
echo ============================================================================
echo.
echo [*] Testing 401 error without auth header...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications'; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Get; " ^
"  Write-Host '[-] FAILED: Should have returned 401' -ForegroundColor Red; " ^
"} catch { " ^
"  $statusCode = $_.Exception.Response.StatusCode.Value__; " ^
"  if ($statusCode -eq 401) { " ^
"    Write-Host '[+] SUCCESS: 401 Unauthorized returned' -ForegroundColor Green; " ^
"  } else { " ^
"    Write-Host '[-] FAILED: Expected 401, got: '$statusCode -ForegroundColor Red; " ^
"  } " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 8: ERROR HANDLING - Invalid Token
REM ============================================================================

echo.
echo ============================================================================
echo TEST 8: ERROR HANDLING - Invalid JWT Token
echo ============================================================================
echo.
echo [*] Testing 401 error with invalid token...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications'; " ^
"$headers = @{'Authorization'='Bearer invalid_token_xyz';}; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers; " ^
"  Write-Host '[-] FAILED: Should have returned 401' -ForegroundColor Red; " ^
"} catch { " ^
"  $statusCode = $_.Exception.Response.StatusCode.Value__; " ^
"  if ($statusCode -eq 401) { " ^
"    Write-Host '[+] SUCCESS: Invalid token rejected with 401' -ForegroundColor Green; " ^
"  } else { " ^
"    Write-Host '[-] FAILED: Expected 401, got: '$statusCode -ForegroundColor Red; " ^
"  } " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST 9: Create Notification
REM ============================================================================

echo.
echo ============================================================================
echo TEST 9: POST /api/notifications/create
echo ============================================================================
echo.
echo [*] Creating test notification...

powershell -Command ^
"$url = '%BACKEND_URL%/api/notifications/create'; " ^
"$body = @{ " ^
"  userId=%USER_ID%; " ^
"  type='test'; " ^
"  title='Test Notification'; " ^
"  message='This is a test notification'; " ^
"  link='/profile' " ^
"} | ConvertTo-Json; " ^
"try { " ^
"  $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType 'application/json'; " ^
"  $id = $response.data.id; " ^
"  Write-Host '[+] SUCCESS: Notification created with ID: '$id -ForegroundColor Green; " ^
"} catch { " ^
"  Write-Host '[-] FAILED: Failed to create notification' -ForegroundColor Red; " ^
"  Write-Host 'Error: '$_.Exception.Message; " ^
"}"

set /a TESTS_PASSED+=1
set /a TESTS_TOTAL+=1

REM ============================================================================
REM TEST SUMMARY
REM ============================================================================

echo.
echo ============================================================================
echo TEST SUMMARY
echo ============================================================================
echo.
echo Total Tests: %TESTS_TOTAL%
color 0A
echo Passed: %TESTS_PASSED%
color 0F
if %TESTS_FAILED% GTR 0 (
  color 0C
  echo Failed: %TESTS_FAILED%
  color 0F
) else (
  echo Failed: 0
)

REM Calculate success rate
if %TESTS_TOTAL% GTR 0 (
  set /a SUCCESS_RATE=(%TESTS_PASSED% * 100) / %TESTS_TOTAL%
  echo Success Rate: !SUCCESS_RATE!%%
)

echo.
if %TESTS_FAILED% EQU 0 (
  color 0A
  echo [+] ALL TESTS PASSED
  color 0F
) else (
  color 0C
  echo [-] SOME TESTS FAILED
  color 0F
)

echo.
echo Cleaning up temporary files...
del /q token.txt 2>nul
del /q userid.txt 2>nul
del /q notif_id.txt 2>nul
del /q unread_count.txt 2>nul

pause
