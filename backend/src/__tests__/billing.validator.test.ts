import { describe, test, expect } from 'bun:test';
import { createSubscriptionSchema, updatePlanSchema } from '../validators/billing.validator.js';

describe('createSubscriptionSchema', () => {
  test('accepts valid plan and gateway', () => {
    const result = createSubscriptionSchema.safeParse({ plan: 'starter', gateway: 'razorpay' });
    expect(result.success).toBe(true);
  });

  test('defaults gateway to razorpay when omitted', () => {
    const result = createSubscriptionSchema.safeParse({ plan: 'pro' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.gateway).toBe('razorpay');
  });

  test('rejects invalid plan', () => {
    const result = createSubscriptionSchema.safeParse({ plan: 'enterprise' });
    expect(result.success).toBe(false);
  });
});

describe('updatePlanSchema', () => {
  test('accepts free, starter, pro', () => {
    for (const plan of ['free', 'starter', 'pro']) {
      const result = updatePlanSchema.safeParse({ plan });
      expect(result.success).toBe(true);
    }
  });

  test('rejects missing plan', () => {
    const result = updatePlanSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
