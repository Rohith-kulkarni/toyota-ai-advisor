ALTER TABLE "Lead" ADD COLUMN "testDriveRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "preferredTestDriveDate" TEXT;
ALTER TABLE "Lead" ADD COLUMN "preferredTestDriveTime" TEXT;
ALTER TABLE "Lead" ADD COLUMN "testDriveLocation" TEXT;
ALTER TABLE "Lead" ADD COLUMN "financeAssistanceRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "monthlyIncomeRange" TEXT;
ALTER TABLE "Lead" ADD COLUMN "downPaymentBudget" TEXT;
ALTER TABLE "Lead" ADD COLUMN "loanTenurePreference" TEXT;
ALTER TABLE "Lead" ADD COLUMN "emiBudget" TEXT;
