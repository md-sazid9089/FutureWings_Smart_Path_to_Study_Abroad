-- ============================================
-- Stripe Integration - Database Verification Queries
-- ============================================
-- Run these queries in Azure Data Studio or SQL Server Management Studio
-- to verify payment data and user subscription status

-- ============================================
-- 1. PAYMENT TABLE VERIFICATION
-- ============================================

-- Check if Payment table exists
SELECT 
    TABLE_NAME,
    TABLE_SCHEMA,
    TABLE_CATALOG
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'Payment'

-- View all payment records
SELECT 
    id,
    userId,
    stripeSessionId,
    stripePaymentId,
    amount,
    currency,
    featureType,
    status,
    createdAt,
    completedAt
FROM Payment
ORDER BY createdAt DESC

-- Count payments by status
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount_cents,
    ROUND(SUM(amount) / 100.0, 2) as total_amount_usd
FROM Payment
GROUP BY status

-- Count payments by feature type
SELECT 
    featureType,
    COUNT(*) as count,
    SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END) as successful_payments,
    ROUND(SUM(CASE WHEN status='SUCCESS' THEN amount ELSE 0 END) / 100.0, 2) as revenue_usd
FROM Payment
GROUP BY featureType

-- Revenue by date (daily breakdown)
SELECT 
    CAST(createdAt AS DATE) as date,
    COUNT(*) as transactions,
    SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END) as successful,
    ROUND(SUM(CASE WHEN status='SUCCESS' THEN amount ELSE 0 END) / 100.0, 2) as daily_revenue_usd
FROM Payment
GROUP BY CAST(createdAt AS DATE)
ORDER BY date DESC

-- Find pending payments (potential issues)
SELECT 
    id,
    userId,
    featureType,
    amount,
    CreatedAt,
    DATEDIFF(hour, createdAt, GETDATE()) as hours_pending
FROM Payment
WHERE status = 'PENDING'
ORDER BY createdAt ASC

-- Find failed payments
SELECT 
    id,
    userId,
    featureType,
    amount,
    stripePaymentId,
    createdAt
FROM Payment
WHERE status = 'FAILED'
ORDER BY createdAt DESC

-- Get payment details for specific user
DECLARE @userId INT = 1; -- Change this to your user ID
SELECT 
    p.id,
    p.featureType,
    p.amount,
    p.status,
    p.createdAt,
    p.completedAt,
    u.email,
    u.fullName
FROM Payment p
JOIN [User] u ON p.userId = u.id
WHERE p.userId = @userId
ORDER BY p.createdAt DESC

-- ============================================
-- 2. USER PREMIUM STATUS VERIFICATION
-- ============================================

-- Check if User table has premium columns
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'User' 
  AND COLUMN_NAME IN ('isPremium', 'premiumFeatures', 'premiumExpiryDate', 'stripeCustomerId')

-- View all premium users
SELECT 
    id,
    email,
    fullName,
    isPremium,
    premiumFeatures,
    premiumExpiryDate,
    stripeCustomerId,
    createdAt
FROM [User]
WHERE isPremium = 1
ORDER BY premiumExpiryDate DESC

-- Check premium status and expiry
SELECT 
    id,
    email,
    isPremium,
    premiumExpiryDate,
    CASE 
        WHEN isPremium = 1 AND premiumExpiryDate > GETDATE() THEN 'ACTIVE'
        WHEN isPremium = 1 AND premiumExpiryDate <= GETDATE() THEN 'EXPIRED'
        ELSE 'INACTIVE'
    END as subscription_status,
    DATEDIFF(day, GETDATE(), premiumExpiryDate) as days_remaining
FROM [User]
WHERE isPremium = 1
ORDER BY premiumExpiryDate DESC

-- Count premium users by feature
SELECT 
    premiumFeatures,
    COUNT(*) as user_count
FROM [User]
WHERE isPremium = 1
GROUP BY premiumFeatures

-- Find users with expired premium (should be inactive)
SELECT 
    id,
    email,
    fullName,
    premiumExpiryDate,
    DATEDIFF(day, premiumExpiryDate, GETDATE()) as days_expired
FROM [User]
WHERE isPremium = 1 AND premiumExpiryDate < GETDATE()
ORDER BY premiumExpiryDate DESC

-- Find Stripe customers
SELECT 
    id,
    email,
    stripeCustomerId,
    createdAt
FROM [User]
WHERE stripeCustomerId IS NOT NULL
ORDER BY createdAt DESC

-- ============================================
-- 3. CONSULTANCY AGENCY VERIFICATION
-- ============================================

-- Check if VisaConsultancy table exists
SELECT 
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'VisaConsultancy'

-- View all active agencies
SELECT 
    id,
    agencyName,
    email,
    phone,
    country,
    city,
    website,
    specializations,
    rating,
    isActive,
    createdAt
FROM VisaConsultancy
WHERE isActive = 1
ORDER BY country, city

-- Count agencies by country
SELECT 
    country,
    COUNT(*) as agency_count
FROM VisaConsultancy
WHERE isActive = 1
GROUP BY country
ORDER BY agency_count DESC

-- Find agencies by specialization
SELECT 
    agencyName,
    country,
    city,
    specializations,
    email,
    website
FROM VisaConsultancy
WHERE isActive = 1 
  AND specializations LIKE '%USA%'
ORDER BY country

-- ============================================
-- 4. COMBINED ANALYTICS
-- ============================================

-- Revenue and user acquisition
SELECT 
    COUNT(DISTINCT p.userId) as paying_users,
    COUNT(DISTINCT CASE WHEN p.status='SUCCESS' THEN p.id END) as successful_transactions,
    ROUND(SUM(CASE WHEN p.status='SUCCESS' THEN p.amount ELSE 0 END) / 100.0, 2) as total_revenue_usd,
    ROUND(AVG(CASE WHEN p.status='SUCCESS' THEN p.amount ELSE 0 END) / 100.0, 2) as avg_transaction_usd,
    COUNT(DISTINCT u.id) as total_premium_users
FROM Payment p
FULL OUTER JOIN [User] u ON p.userId = u.id AND u.isPremium = 1

-- Top features by revenue
SELECT TOP 10
    featureType,
    COUNT(*) as purchases,
    ROUND(SUM(amount) / 100.0, 2) as revenue_usd,
    ROUND(AVG(amount) / 100.0, 2) as avg_price_usd
FROM Payment
WHERE status = 'SUCCESS'
GROUP BY featureType
ORDER BY revenue_usd DESC

-- User purchase frequency
SELECT 
    userId,
    COUNT(*) as purchase_count,
    ROUND(SUM(amount) / 100.0, 2) as total_spent_usd,
    MAX(createdAt) as last_purchase
FROM Payment
WHERE status = 'SUCCESS'
GROUP BY userId
HAVING COUNT(*) > 1
ORDER BY total_spent_usd DESC

-- ============================================
-- 5. VERIFICATION CHECKLIST
-- ============================================

-- Run all these to create a complete verification report:

PRINT '=== STRIPE INTEGRATION DATABASE VERIFICATION ==='
PRINT ''

PRINT '✓ Checking Payment table...'
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Payment')
    PRINT '  Payment table: EXISTS'
ELSE
    PRINT '  Payment table: MISSING ❌'

PRINT '✓ Checking VisaConsultancy table...'
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='VisaConsultancy')
    PRINT '  VisaConsultancy table: EXISTS'
ELSE
    PRINT '  VisaConsultancy table: MISSING ❌'

PRINT '✓ Checking User premium columns...'
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='User' AND COLUMN_NAME='isPremium')
    PRINT '  isPremium column: EXISTS'
ELSE
    PRINT '  isPremium column: MISSING ❌'

PRINT '✓ Data Summary:'
SELECT 
    'Total Payment Records' as metric,
    COUNT(*) as value
FROM Payment
UNION ALL
SELECT 
    'Successful Payments',
    COUNT(*)
FROM Payment
WHERE status = 'SUCCESS'
UNION ALL
SELECT 
    'Failed Payments',
    COUNT(*)
FROM Payment
WHERE status = 'FAILED'
UNION ALL
SELECT 
    'Pending Payments',
    COUNT(*)
FROM Payment
WHERE status = 'PENDING'
UNION ALL
SELECT 
    'Premium Users',
    COUNT(*)
FROM [User]
WHERE isPremium = 1
UNION ALL
SELECT 
    'Active Consultancy Agencies',
    COUNT(*)
FROM VisaConsultancy
WHERE isActive = 1

PRINT ''
PRINT '=== END OF VERIFICATION ==='

-- ============================================
-- 6. TROUBLESHOOTING QUERIES
-- ============================================

-- Find users who made payment but aren't premium
SELECT 
    DISTINCT p.userId,
    u.email,
    p.featureType,
    p.status,
    u.isPremium,
    'MISMATCH ❌' as issue
FROM Payment p
JOIN [User] u ON p.userId = u.id
WHERE p.status = 'SUCCESS' AND u.isPremium = 0

-- Find premium users with no payment record
SELECT 
    u.id,
    u.email,
    u.isPremium,
    u.premiumFeatures,
    COUNT(p.id) as payment_count
FROM [User] u
LEFT JOIN Payment p ON u.id = p.userId AND p.status = 'SUCCESS'
WHERE u.isPremium = 1
GROUP BY u.id, u.email, u.isPremium, u.premiumFeatures
HAVING COUNT(p.id) = 0

-- Find duplicate payment sessions
SELECT 
    stripeSessionId,
    COUNT(*) as count
FROM Payment
GROUP BY stripeSessionId
HAVING COUNT(*) > 1

-- Find payments older than 30 days still marked PENDING
SELECT 
    id,
    userId,
    featureType,
    createdAt,
    DATEDIFF(day, createdAt, GETDATE()) as days_old
FROM Payment
WHERE status = 'PENDING' 
  AND DATEDIFF(day, createdAt, GETDATE()) > 30
ORDER BY createdAt ASC
