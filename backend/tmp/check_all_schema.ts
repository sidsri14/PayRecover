import { PrismaClient } from '@prisma/client';
// @ts-ignore
import process from 'process';
const prisma = new PrismaClient();

async function checkAllSchema() {
  try {
    const tables = ['Monitor', 'Log', 'Alert', 'Incident'];
    for (const table of tables) {
      const columns: any[] = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
      `);
      console.log(`Columns in ${table} table:`, columns.map(c => c.column_name).join(', '));
    }
  } catch (err) {
    console.error('Failed to query info schema:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkAllSchema();
