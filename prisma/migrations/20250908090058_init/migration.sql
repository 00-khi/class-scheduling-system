/*
  Warnings:

  - Added the required column `updatedAt` to the `AcademicQualification` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicQualification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AcademicQualification" ("code", "id", "name") SELECT "code", "id", "name" FROM "AcademicQualification";
DROP TABLE "AcademicQualification";
ALTER TABLE "new_AcademicQualification" RENAME TO "AcademicQualification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
