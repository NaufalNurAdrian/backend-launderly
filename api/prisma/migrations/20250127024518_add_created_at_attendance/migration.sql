/*
  Warnings:

  - You are about to drop the column `userRole` on the `Attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "userRole",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "checkIn" SET DEFAULT CURRENT_TIMESTAMP;
