-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "approvalComments" TEXT,
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "rejectionDate" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;
