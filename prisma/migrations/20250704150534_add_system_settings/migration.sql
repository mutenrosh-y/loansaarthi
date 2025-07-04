-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';
