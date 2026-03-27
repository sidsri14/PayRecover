import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function list() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \`);
    console.log('Tables:', res.rows.map(r => r.table_name));
    await client.end();
  } catch (err) {
    console.error('Failed:', err);
  }
}
list();
