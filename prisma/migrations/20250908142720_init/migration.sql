-- CreateTable
CREATE TABLE "AcademicQualification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicQualification_code_key" ON "AcademicQualification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicQualification_name_key" ON "AcademicQualification"("name");
