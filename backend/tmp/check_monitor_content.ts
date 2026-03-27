import { PrismaClient } from '@prisma/client';
// @ts-ignore
import process from 'process';
const prisma = new PrismaClient();

async function checkContent() {
  try {
    const monitors: any[] = await prisma.$queryRaw`SELECT id, name, url FROM "Monitor"`;
    console.log('Monitors in DB:', JSON.stringify(monitors, null, 2));
  } catch (err) {
    console.error('Failed to query content:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkContent();
