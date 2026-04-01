import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import billingRoutes from './routes/billing.routes.js';
import demoRoutes from './routes/demo.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import sourceRoutes from './routes/source.routes.js';
import { prisma } from './utils/prisma.js';

const app = express();

// Enable trust proxy for correct IP detection in cloud environments
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));
app.use(morgan('dev'));

// Webhook route needs raw body for signature verification
app.use('/api/webhooks', webhookRoutes);

// General purpose body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Global rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  validate: false, // Disable internal validation checks to prevent startup warnings
});

app.use('/api/', globalLimiter);

// Health Check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', version: '1.0.0' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sources', sourceRoutes);

// Error Handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    requestId: _req.headers['x-request-id']
  });
});

export { app };
