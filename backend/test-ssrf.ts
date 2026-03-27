import { validateUrlForSSRF } from './src/utils/security.js';

async function test() {
  const tests = [
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://169.254.169.254',
    'https://google.com'
  ];

  for (const t of tests) {
    const safe = await validateUrlForSSRF(t);
    console.log(`${t}: ${safe ? 'SAFE' : 'BLOCKED'}`);
  }
}

test();
