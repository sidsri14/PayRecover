import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    const columns: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Monitor'
    `;
    console.log('Columns in Monitor table:', columns);
  } catch (err) {
    console.error('Failed to query info schema:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
