/*
  Warnings:

  - Added the required column `cloudinaryPublicId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN "cloudinaryPublicId" TEXT;

-- Update existing documents to extract public_id from URL
UPDATE "Document"
SET "cloudinaryPublicId" = REGEXP_REPLACE(url, '^.*?/loansaarthi/[^/]+/([^/]+)\.[^.]+$', '\1')
WHERE url LIKE '%/loansaarthi/%';

-- Make the column required after updating existing data
ALTER TABLE "Document" ALTER COLUMN "cloudinaryPublicId" SET NOT NULL;
