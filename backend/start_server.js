import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting Backend with DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');

const child = spawn('bun', ['run', 'src/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
});
