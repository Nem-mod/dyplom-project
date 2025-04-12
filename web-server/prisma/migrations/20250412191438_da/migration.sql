/*
  Warnings:

  - A unique constraint covering the columns `[timescaleIdentifier]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "timescaleIdentifier" TEXT DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_timescaleIdentifier_key" ON "Dashboard"("timescaleIdentifier");
