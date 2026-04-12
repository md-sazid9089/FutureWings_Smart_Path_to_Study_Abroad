BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Notifications] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [message] NVARCHAR(500) NOT NULL,
    [read] BIT NOT NULL CONSTRAINT [Notifications_read_df] DEFAULT 0,
    [link] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notifications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notifications_userId_idx] ON [dbo].[Notifications]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notifications_read_idx] ON [dbo].[Notifications]([read]);

-- AddForeignKey
ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [Notifications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
