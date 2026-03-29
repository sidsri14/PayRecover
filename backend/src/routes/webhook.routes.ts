import { Router } from 'express';
import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Use raw body parser so we can verify Razorpay's HMAC-SHA256 signature
router.post('/', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

export default router;
