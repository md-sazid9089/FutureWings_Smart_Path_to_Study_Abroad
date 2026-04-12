-- ============================================================================
-- NOTIFICATION SYSTEM - DATABASE VERIFICATION QUERIES
-- ============================================================================
-- Use these queries to verify notification system functionality
-- Database: Azure SQL Server
-- ============================================================================

-- ============================================================================
-- 1. TABLE STRUCTURE VERIFICATION
-- ============================================================================

-- Check Notifications table structure
EXEC sp_help 'Notifications';

-- List all columns
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Notifications'
ORDER BY ORDINAL_POSITION;

-- Check table constraints
SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'Notifications';

-- Check indexes on Notifications table
SELECT 
    name as index_name,
    type_desc as index_type
FROM sys.indexes
WHERE object_id = OBJECT_ID('Notifications');

-- ============================================================================
-- 2. NOTIFICATION COUNT QUERIES
-- ============================================================================

-- Total notifications in database
SELECT COUNT(*) as total_notifications FROM Notifications;

-- Count by read status
SELECT 
    read as read_status,
    COUNT(*) as count,
    CASE WHEN read = 0 THEN 'Unread' ELSE 'Read' END as status_label
FROM Notifications
GROUP BY read;

-- Count by notification type
SELECT 
    type as notification_type,
    COUNT(*) as count,
    SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread_count
FROM Notifications
GROUP BY type
ORDER BY count DESC;

-- Count by user
SELECT TOP 20
    userId,
    COUNT(*) as total_notifications,
    SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread_count,
    SUM(CASE WHEN read = 1 THEN 1 ELSE 0 END) as read_count
FROM Notifications
GROUP BY userId
ORDER BY total_notifications DESC;

-- ============================================================================
-- 3. UNREAD NOTIFICATIONS QUERIES
-- ============================================================================

-- Get all unread notifications
SELECT 
    id,
    userId,
    type,
    title,
    message,
    link,
    createdAt,
    updatedAt
FROM Notifications
WHERE read = 0
ORDER BY createdAt DESC;

-- Get unread notifications for specific user
DECLARE @userId INT = 123;  -- Change 123 to test user ID

SELECT 
    id,
    type,
    title,
    message,
    link,
    createdAt
FROM Notifications
WHERE userId = @userId AND read = 0
ORDER BY createdAt DESC;

-- Count unread notifications per user
SELECT TOP 10
    userId,
    COUNT(*) as unread_count
FROM Notifications
WHERE read = 0
GROUP BY userId
ORDER BY unread_count DESC;

-- ============================================================================
-- 4. SPECIFIC TEST SCENARIOS
-- ============================================================================

-- Scenario 1: Verify Notification Fetch Response (Mock API Response)
-- This verifies that a GET /api/notifications?read=unread query would return correctly
SELECT TOP 20
    id,
    userId,
    type,
    title,
    message,
    link,
    read as read_status,
    createdAt,
    updatedAt
FROM Notifications
WHERE read = 0  -- Simulating ?read=unread
ORDER BY createdAt DESC;

-- Scenario 2: Verify Unread Count (Mock /api/notifications/count)
DECLARE @currentUserId INT = 123;

SELECT @currentUserId as userId, COUNT(*) as unreadCount
FROM Notifications
WHERE userId = @currentUserId AND read = 0;

-- Scenario 3: Verify Mark as Read Operation
-- Before marking as read:
SELECT * FROM Notifications WHERE id = 1;

-- After marking as read (simulated):
-- The read field would change from 0 to 1
-- The updatedAt field would update to current timestamp
SELECT 
    id,
    read as status_before,
    1 as status_after,
    updatedAt as old_timestamp
FROM Notifications 
WHERE id = 1;

-- Scenario 4: Verify Notification is removed from unread list after read
-- Query BEFORE marking as read:
SELECT COUNT(*) as total_unread
FROM Notifications
WHERE userId = 123 AND read = 0;

-- Query AFTER marking one as read (should decrease by 1):
SELECT COUNT(*) as total_unread
FROM Notifications
WHERE userId = 123 AND read = 0;

-- ============================================================================
-- 5. POLLING MECHANISM VERIFICATION
-- ============================================================================

-- Verify new notifications within last 30 seconds
SELECT 
    id,
    userId,
    type,
    title,
    createdAt,
    DATEDIFF(SECOND, createdAt, GETUTCDATE()) as seconds_ago
FROM Notifications
WHERE createdAt > DATEADD(SECOND, -30, GETUTCDATE())
ORDER BY createdAt DESC;

-- Verify polling queries are efficient
-- Check query execution time:
SET STATISTICS TIME ON;
SET STATISTICS IO ON;

SELECT TOP 20
    id, userId, type, title, message, link, read, createdAt, updatedAt
FROM Notifications
WHERE userId = 123 AND read = 0
ORDER BY createdAt DESC;

-- Expected: < 100ms, Reads: < 10

SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;

-- ============================================================================
-- 6. NOTIFICATION TYPE ANALYSIS
-- ============================================================================

-- Subscription notifications
SELECT 
    id,
    userId,
    title,
    message,
    read,
    createdAt
FROM Notifications
WHERE type = 'subscription'
ORDER BY createdAt DESC;

-- AI recommendation notifications
SELECT 
    id,
    userId,
    title,
    message,
    read,
    createdAt
FROM Notifications
WHERE type = 'ai'
ORDER BY createdAt DESC;

-- Visa outcome notifications
SELECT 
    id,
    userId,
    title,
    message,
    read,
    createdAt
FROM Notifications
WHERE type = 'visa'
ORDER BY createdAt DESC;

-- Application update notifications
SELECT 
    id,
    userId,
    title,
    message,
    read,
    createdAt
FROM Notifications
WHERE type = 'application'
ORDER BY createdAt DESC;

-- Admin update notifications
SELECT 
    id,
    userId,
    title,
    message,
    read,
    createdAt
FROM Notifications
WHERE type = 'admin-update'
ORDER BY createdAt DESC;

-- Recommendation notifications
SELECT 
    id,
    userId,
    title,
    message,
    read,
    createdAt
FROM Notifications
WHERE type = 'recommendation'
ORDER BY createdAt DESC;

-- ============================================================================
-- 7. NOTIFICATION TIMESTAMP ANALYSIS
-- ============================================================================

-- Verify timestamps are being updated correctly
SELECT TOP 20
    id,
    userId,
    title,
    createdAt,
    updatedAt,
    DATEDIFF(SECOND, createdAt, updatedAt) as seconds_between_create_update,
    DATEDIFF(SECOND, updatedAt, GETUTCDATE()) as seconds_since_update
FROM Notifications
WHERE read = 1  -- Recently marked as read
ORDER BY updatedAt DESC;

-- Find notifications never marked as read (updatedAt = createdAt)
SELECT TOP 10
    id,
    userId,
    title,
    createdAt,
    updatedAt,
    CASE 
        WHEN createdAt = updatedAt THEN 'Never read'
        ELSE 'Marked as read'
    END as status
FROM Notifications
ORDER BY createdAt DESC;

-- ============================================================================
-- 8. DATA CONSISTENCY CHECKS
-- ============================================================================

-- Check for orphaned user IDs (users that don't exist)
SELECT DISTINCT
    n.userId
FROM Notifications n
LEFT JOIN Users u ON n.userId = u.id
WHERE u.id IS NULL;

-- Check for invalid notification types
SELECT DISTINCT type, COUNT(*) as count
FROM Notifications
GROUP BY type
HAVING type NOT IN ('subscription', 'visa', 'ai', 'admin-update', 'recommendation', 'application');

-- Check for NULL values in required fields
SELECT 
    COUNT(CASE WHEN userId IS NULL THEN 1 END) as null_userIds,
    COUNT(CASE WHEN type IS NULL THEN 1 END) as null_types,
    COUNT(CASE WHEN title IS NULL THEN 1 END) as null_titles,
    COUNT(CASE WHEN message IS NULL THEN 1 END) as null_messages,
    COUNT(CASE WHEN read IS NULL THEN 1 END) as null_read_flags
FROM Notifications;

-- Check for duplicate notifications (same userId, type, title within 1 second)
SELECT 
    userId,
    type,
    title,
    COUNT(*) as duplicate_count,
    MIN(createdAt) as first_created,
    MAX(createdAt) as last_created
FROM Notifications
GROUP BY userId, type, title
HAVING COUNT(*) > 1 AND DATEDIFF(SECOND, MIN(createdAt), MAX(createdAt)) < 60
ORDER BY duplicate_count DESC;

-- ============================================================================
-- 9. ADMIN UPDATE VERIFICATION
-- ============================================================================

-- Verify admin-update notifications sent to multiple users
SELECT 
    title,
    COUNT(DISTINCT userId) as users_notified,
    MIN(createdAt) as first_sent,
    MAX(createdAt) as last_sent
FROM Notifications
WHERE type = 'admin-update'
GROUP BY title
ORDER BY users_notified DESC;

-- Check if all users received admin update notification
DECLARE @totalUsers INT;
DECLARE @notifiedUsers INT;

SELECT @totalUsers = COUNT(*) FROM Users WHERE role = 'student';
SELECT @notifiedUsers = COUNT(DISTINCT userId) 
FROM Notifications 
WHERE type = 'admin-update' 
AND createdAt > DATEADD(HOUR, -1, GETUTCDATE());

SELECT 
    @totalUsers as total_users,
    @notifiedUsers as users_notified,
    CASE 
        WHEN @notifiedUsers = @totalUsers THEN 'All users notified'
        WHEN @notifiedUsers = 0 THEN 'No users notified'
        ELSE CAST(@notifiedUsers AS VARCHAR(10)) + ' out of ' + CAST(@totalUsers AS VARCHAR(10)) + ' users notified'
    END as notification_status;

-- ============================================================================
-- 10. PERFORMANCE ANALYSIS
-- ============================================================================

-- Query performance for polling (most frequent query)
SELECT 
    COUNT(*) as notification_count,
    DATALENGTH((
        SELECT 
            id, userId, type, title, message, link, read, createdAt, updatedAt
        FROM Notifications
        WHERE userId = 123 AND read = 0
        ORDER BY createdAt DESC
        FOR JSON PATH
    )) as response_size_bytes
FROM Notifications
WHERE userId = 123 AND read = 0;

-- Table size analysis
SELECT 
    TABLE_NAME,
    CAST(SUM(RESERVED_PAGE_COUNT * 8.0 / 1024 / 1024) AS DECIMAL(18,2)) as size_mb
FROM sys.dm_db_partition_stats ps
JOIN sys.objects o ON ps.object_id = o.object_id
WHERE o.name = 'Notifications'
GROUP BY TABLE_NAME;

-- ============================================================================
-- 11. DAILY USAGE STATISTICS
-- ============================================================================

-- Notifications created per day
SELECT 
    CAST(createdAt AS DATE) as date,
    COUNT(*) as notifications_created,
    COUNT(DISTINCT userId) as unique_users
FROM Notifications
GROUP BY CAST(createdAt AS DATE)
ORDER BY date DESC;

-- Notifications read per day
SELECT 
    CAST(updatedAt AS DATE) as date,
    COUNT(*) as notifications_read
FROM Notifications
WHERE read = 1
GROUP BY CAST(updatedAt AS DATE)
ORDER BY date DESC;

-- Average time to read notification
SELECT 
    AVG(DATEDIFF(HOUR, createdAt, updatedAt)) as avg_hours_to_read,
    MIN(DATEDIFF(HOUR, createdAt, updatedAt)) as quickest_hour,
    MAX(DATEDIFF(HOUR, createdAt, updatedAt)) as slowest_hour
FROM Notifications
WHERE read = 1;

-- ============================================================================
-- 12. VERIFICATION FOR SPECIFIC TEST USER
-- ============================================================================

-- Replace 123 with actual test user ID

-- Check test user exists
SELECT id, email, fullName, isPremium
FROM Users
WHERE id = 123;

-- All notifications for test user
SELECT 
    id,
    type,
    title,
    message,
    read,
    createdAt,
    updatedAt
FROM Notifications
WHERE userId = 123
ORDER BY createdAt DESC;

-- Unread notifications for test user
SELECT COUNT(*) as unread_count
FROM Notifications
WHERE userId = 123 AND read = 0;

-- Test user's subscription notifications
SELECT *
FROM Notifications
WHERE userId = 123 AND type = 'subscription'
ORDER BY createdAt DESC;

-- Verify mark as read operation for test user
SELECT TOP 5
    id,
    read as current_status,
    updatedAt,
    DATEDIFF(SECOND, updatedAt, GETUTCDATE()) as seconds_since_update
FROM Notifications
WHERE userId = 123 AND read = 1
ORDER BY updatedAt DESC;

-- ============================================================================
-- 13. CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- Count notifications older than 90 days (for archival consideration)
SELECT COUNT(*) as old_notifications_count
FROM Notifications
WHERE createdAt < DATEADD(DAY, -90, GETUTCDATE());

-- View notifications older than 90 days
SELECT id, userId, title, createdAt
FROM Notifications
WHERE createdAt < DATEADD(DAY, -90, GETUTCDATE())
ORDER BY createdAt DESC;

-- Archive old notifications to separate table (NOT executed automatically):
-- INSERT INTO Notifications_Archive
-- SELECT * FROM Notifications
-- WHERE createdAt < DATEADD(DAY, -90, GETUTCDATE());

-- Delete all read notifications for a specific user
-- DELETE FROM Notifications
-- WHERE userId = 123 AND read = 1;

-- Delete old notifications (older than 90 days)
-- DELETE FROM Notifications
-- WHERE createdAt < DATEADD(DAY, -90, GETUTCDATE());

-- ============================================================================
-- 14. TESTING QUERIES - MARK AS READ
-- ============================================================================

-- Before marking as read
SELECT 
    id,
    read as status_before,
    updatedAt as updated_before
FROM Notifications 
WHERE id = 1;

-- Execute mark as read update (in application or via SQL):
-- UPDATE Notifications SET read = 1, updatedAt = GETUTCDATE() WHERE id = 1;

-- After marking as read
SELECT 
    id,
    read as status_after,
    updatedAt as updated_after
FROM Notifications 
WHERE id = 1;

-- Verify it's not in unread list anymore
SELECT COUNT(*) as still_unread
FROM Notifications
WHERE id = 1 AND read = 0;  -- Should return 0

-- ============================================================================
-- 15. BATCH OPERATIONS VERIFICATION
-- ============================================================================

-- Count notifications before mark all as read
SELECT COUNT(*) as unread_before
FROM Notifications
WHERE userId = 123 AND read = 0;

-- Execute mark all as read (in application):
-- UPDATE Notifications SET read = 1, updatedAt = GETUTCDATE() 
-- WHERE userId = 123 AND read = 0;

-- Count after mark all as read
SELECT COUNT(*) as unread_after
FROM Notifications
WHERE userId = 123 AND read = 0;  -- Should be 0

-- Verify all were updated
SELECT COUNT(DISTINCT read) as distinct_read_values
FROM Notifications
WHERE userId = 123;  -- Should be 1 (only value 1 = read)

-- ============================================================================
-- QUICK TEST COMMANDS
-- ============================================================================

-- Copy and paste these individually to run quick tests:

-- 1. How many total notifications?
SELECT COUNT(*) FROM Notifications;

-- 2. How many unread?
SELECT COUNT(*) FROM Notifications WHERE read = 0;

-- 3. How many for test user 123?
SELECT COUNT(*) FROM Notifications WHERE userId = 123;

-- 4. How many unread for test user 123?
SELECT COUNT(*) FROM Notifications WHERE userId = 123 AND read = 0;

-- 5. List last 5 notifications for test user 123
SELECT TOP 5 id, type, title, read, createdAt FROM Notifications 
WHERE userId = 123 ORDER BY createdAt DESC;

-- 6. Show unread count by type
SELECT type, COUNT(*) FROM Notifications WHERE read = 0 GROUP BY type;

-- 7. Show notifications from last hour
SELECT TOP 10 id, userId, type, title, createdAt FROM Notifications 
WHERE createdAt > DATEADD(HOUR, -1, GETUTCDATE()) ORDER BY createdAt DESC;

-- ============================================================================
-- END OF NOTIFICATION DATABASE VERIFICATION QUERIES
-- ============================================================================
