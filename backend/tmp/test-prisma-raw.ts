import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  try {
    const res = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Prisma raw query success:', res);
  } catch (err) {
    console.error('Prisma raw query failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
