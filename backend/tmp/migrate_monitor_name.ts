import { PrismaClient } from '@prisma/client';
// @ts-ignore
import process from 'process';
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Migrating "Monitor" table...');
    // Add "name" column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);
    `);
    
    // Default "name" to "url" for existing records
    await prisma.$executeRawUnsafe(`
      UPDATE "Monitor" SET "name" = "url" WHERE "name" IS NULL;
    `);

    console.log('Migrating "Incident" table...');
    // Add "status" column if it doesn't exist (INVESTIGATING, RESOLVED, etc.)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Incident" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'INVESTIGATING';
    `);

    // Ensure RESOLVED status for resolved incidents
    await prisma.$executeRawUnsafe(`
      UPDATE "Incident" SET "status" = 'RESOLVED' WHERE "resolvedAt" IS NOT NULL;
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

migrate();
