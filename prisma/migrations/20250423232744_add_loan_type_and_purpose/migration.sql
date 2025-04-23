/*
  Warnings:

  - Added the required column `purpose` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "purpose" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
