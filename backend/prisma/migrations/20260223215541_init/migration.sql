BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(255) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(10) NOT NULL CONSTRAINT [Users_role_df] DEFAULT 'USER',
    [fullName] NVARCHAR(150),
    [cgpa] FLOAT(53),
    [degreeLevel] NVARCHAR(50),
    [major] NVARCHAR(100),
    [fundScore] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Countries] (
    [id] INT NOT NULL IDENTITY(1,1),
    [countryName] NVARCHAR(100) NOT NULL,
    [region] NVARCHAR(100),
    [currency] NVARCHAR(20),
    [tierLevel] INT NOT NULL CONSTRAINT [Countries_tierLevel_df] DEFAULT 3,
    [isActive] BIT NOT NULL CONSTRAINT [Countries_isActive_df] DEFAULT 1,
    CONSTRAINT [Countries_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Universities] (
    [id] INT NOT NULL IDENTITY(1,1),
    [countryId] INT NOT NULL,
    [universityName] NVARCHAR(200) NOT NULL,
    [type] NVARCHAR(50),
    [city] NVARCHAR(100),
    CONSTRAINT [Universities_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Programs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [universityId] INT NOT NULL,
    [programName] NVARCHAR(200) NOT NULL,
    [level] NVARCHAR(50),
    [tuitionPerYear] FLOAT(53),
    CONSTRAINT [Programs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Scholarships] (
    [id] INT NOT NULL IDENTITY(1,1),
    [countryId] INT NOT NULL,
    [scholarshipName] NVARCHAR(200) NOT NULL,
    [eligibilityCriteria] NVARCHAR(500),
    [applyLink] NVARCHAR(500),
    [deadline] DATETIME2,
    [amount] FLOAT(53),
    CONSTRAINT [Scholarships_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserDocuments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [filePath] NVARCHAR(500) NOT NULL,
    [fileType] NVARCHAR(50),
    [verificationStatus] NVARCHAR(20) NOT NULL CONSTRAINT [UserDocuments_verificationStatus_df] DEFAULT 'PENDING',
    [adminNote] NVARCHAR(500),
    [uploadedAt] DATETIME2 NOT NULL CONSTRAINT [UserDocuments_uploadedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [UserDocuments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ApplicationStatuses] (
    [id] INT NOT NULL IDENTITY(1,1),
    [statusName] NVARCHAR(50) NOT NULL,
    CONSTRAINT [ApplicationStatuses_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ApplicationStatuses_statusName_key] UNIQUE NONCLUSTERED ([statusName])
);

-- CreateTable
CREATE TABLE [dbo].[Applications] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [countryId] INT NOT NULL,
    [programId] INT NOT NULL,
    [statusId] INT NOT NULL,
    [appliedDate] DATETIME2 NOT NULL CONSTRAINT [Applications_appliedDate_df] DEFAULT CURRENT_TIMESTAMP,
    [intakeApplied] NVARCHAR(50),
    CONSTRAINT [Applications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[VisaOutcomes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [applicationId] INT NOT NULL,
    [decision] NVARCHAR(20) NOT NULL,
    [reasonTitle] NVARCHAR(200),
    [notes] NVARCHAR(1000),
    [destinationDate] DATETIME2,
    CONSTRAINT [VisaOutcomes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [VisaOutcomes_applicationId_key] UNIQUE NONCLUSTERED ([applicationId])
);

-- CreateTable
CREATE TABLE [dbo].[CountryRatings] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [countryId] INT NOT NULL,
    [applicationId] INT NOT NULL,
    [ratingValue] INT NOT NULL,
    [comments] NVARCHAR(1000),
    [ratingType] NVARCHAR(10) NOT NULL CONSTRAINT [CountryRatings_ratingType_df] DEFAULT 'POST',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CountryRatings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CountryRatings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CountryRatings_userId_countryId_ratingType_key] UNIQUE NONCLUSTERED ([userId],[countryId],[ratingType])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Universities_countryId_idx] ON [dbo].[Universities]([countryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Programs_universityId_idx] ON [dbo].[Programs]([universityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Scholarships_countryId_idx] ON [dbo].[Scholarships]([countryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [UserDocuments_userId_idx] ON [dbo].[UserDocuments]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Applications_userId_idx] ON [dbo].[Applications]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Applications_countryId_idx] ON [dbo].[Applications]([countryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Applications_programId_idx] ON [dbo].[Applications]([programId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Applications_statusId_idx] ON [dbo].[Applications]([statusId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CountryRatings_countryId_idx] ON [dbo].[CountryRatings]([countryId]);

-- AddForeignKey
ALTER TABLE [dbo].[Universities] ADD CONSTRAINT [Universities_countryId_fkey] FOREIGN KEY ([countryId]) REFERENCES [dbo].[Countries]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Programs] ADD CONSTRAINT [Programs_universityId_fkey] FOREIGN KEY ([universityId]) REFERENCES [dbo].[Universities]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Scholarships] ADD CONSTRAINT [Scholarships_countryId_fkey] FOREIGN KEY ([countryId]) REFERENCES [dbo].[Countries]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserDocuments] ADD CONSTRAINT [UserDocuments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Applications] ADD CONSTRAINT [Applications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Applications] ADD CONSTRAINT [Applications_countryId_fkey] FOREIGN KEY ([countryId]) REFERENCES [dbo].[Countries]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Applications] ADD CONSTRAINT [Applications_programId_fkey] FOREIGN KEY ([programId]) REFERENCES [dbo].[Programs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Applications] ADD CONSTRAINT [Applications_statusId_fkey] FOREIGN KEY ([statusId]) REFERENCES [dbo].[ApplicationStatuses]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[VisaOutcomes] ADD CONSTRAINT [VisaOutcomes_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[Applications]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CountryRatings] ADD CONSTRAINT [CountryRatings_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CountryRatings] ADD CONSTRAINT [CountryRatings_countryId_fkey] FOREIGN KEY ([countryId]) REFERENCES [dbo].[Countries]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CountryRatings] ADD CONSTRAINT [CountryRatings_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[Applications]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
