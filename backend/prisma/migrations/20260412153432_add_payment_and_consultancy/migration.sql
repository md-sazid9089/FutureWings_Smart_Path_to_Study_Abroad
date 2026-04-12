BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Countries] ADD [visaFeeNote] NVARCHAR(100);

-- AlterTable
ALTER TABLE [dbo].[Users] ADD [isPremium] BIT NOT NULL CONSTRAINT [Users_isPremium_df] DEFAULT 0,
[premiumExpiryDate] DATETIME2,
[premiumFeatures] NVARCHAR(100),
[profileHeadline] NVARCHAR(120),
[stripeCustomerId] NVARCHAR(255);

-- CreateTable
CREATE TABLE [dbo].[Payments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [stripeSessionId] NVARCHAR(255) NOT NULL,
    [stripePaymentId] NVARCHAR(255),
    [amount] INT NOT NULL,
    [currency] NVARCHAR(10) NOT NULL CONSTRAINT [Payments_currency_df] DEFAULT 'USD',
    [featureType] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [Payments_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Payments_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [completedAt] DATETIME2,
    CONSTRAINT [Payments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[VisaConsultancies] (
    [id] INT NOT NULL IDENTITY(1,1),
    [agencyName] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(255),
    [phone] NVARCHAR(20),
    [country] NVARCHAR(100),
    [city] NVARCHAR(100),
    [website] NVARCHAR(500),
    [description] NVARCHAR(1000),
    [specializations] NVARCHAR(500),
    [rating] FLOAT(53) CONSTRAINT [VisaConsultancies_rating_df] DEFAULT 0.0,
    [isActive] BIT NOT NULL CONSTRAINT [VisaConsultancies_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [VisaConsultancies_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [VisaConsultancies_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Payments_userId_idx] ON [dbo].[Payments]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Payments_stripeSessionId_idx] ON [dbo].[Payments]([stripeSessionId]);

-- AddForeignKey
ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [Payments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
