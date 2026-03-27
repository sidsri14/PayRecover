@echo off
set DATABASE_URL=postgres://u746i9d57a9n:P5kI7lWp2mZ8@ep-tight-waterfall-a1q3r7s3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set JWT_SECRET=super-secret-key-123
set ALLOWED_ORIGINS=http://localhost:5173
bun run src/index.ts
