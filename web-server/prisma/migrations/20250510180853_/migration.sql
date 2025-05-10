/*
  Warnings:

  - Added the required column `description` to the `Dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "description" TEXT NOT NULL;
