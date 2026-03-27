import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function sync() {
  try {
    console.log('Synchronizing Incident table manually...');
    
    // 1. Create Incident table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Incident" (
        "id" TEXT NOT NULL,
        "monitorId" TEXT NOT NULL,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolvedAt" TIMESTAMP(3),
        "durationSecs" INTEGER,
        "cause" TEXT,

        CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // 2. Add foreign key if not exists (checked via information_schema)
    // Actually, simple way: try to add it and catch error
    try {
      await prisma.$executeRawUnsafe(\`
        ALTER TABLE "Incident" 
        ADD CONSTRAINT "Incident_monitorId_fkey" 
        FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      \`);
    } catch (e) {
      console.log('Foreign key likely already exists or table setup failed.');
    }

    // 3. Add index
    try {
      await prisma.$executeRawUnsafe(\`
        CREATE INDEX "Incident_monitorId_idx" ON "Incident"("monitorId");
      \`);
    } catch (e) {
      console.log('Index likely already exists.');
    }

    console.log('Manual sync completed!');
  } catch (err) {
    console.error('Manual sync failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}
sync();
