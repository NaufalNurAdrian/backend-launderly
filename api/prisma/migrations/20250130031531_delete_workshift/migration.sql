/*
  Warnings:

  - You are about to drop the column `workShift` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "workShift";

-- DropEnum
DROP TYPE "EmployeeWorkShift";
