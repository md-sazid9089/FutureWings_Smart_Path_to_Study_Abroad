BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Programs] ADD [durationMonths] INT;
ALTER TABLE [dbo].[Programs] ADD [intakeSeasons] NVARCHAR(100);
ALTER TABLE [dbo].[Programs] ADD [programOverview] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
