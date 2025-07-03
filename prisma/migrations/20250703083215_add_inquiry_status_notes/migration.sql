-- AlterTable
ALTER TABLE "LoanInquiry" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'New';
