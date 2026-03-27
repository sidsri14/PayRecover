import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import authRoutes from './routes/auth.routes';
import monitorRoutes from './routes/monitor.routes';
import incidentRoutes from './routes/incident.routes';
import { errorHandler } from './middleware/error.middleware';
import rateLimit from 'express-rate-limit';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Phase 2: Security Hardening (OWASP Headers)
app.use(helmet());

// Phase 2: Cookie-based Sessions
app.use(cookieParser(process.env.COOKIE_SECRET || process.env.JWT_SECRET));

// Phase 2: Payload Hardening (Prevent large body DOS)
app.use(express.json({ limit: '10kb' }));

// Phase 5: CORS Hardening
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Phase 2: CSRF Protection (double-submit signed cookie)
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET!,
  getSessionIdentifier: (req) => req.ip ?? '',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

// Public endpoint: frontend fetches this before any mutation
app.get('/api/csrf-token', (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ token });
});

// Phase 5: Auth Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Apply CSRF protection to all mutating API routes
app.use('/api', doubleCsrfProtection);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/incidents', incidentRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.send('API Monitoring SaaS Backend is running.');
});

// Serve frontend static files in production
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// Fallback all unknown routes to the React index.html for CSR
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
