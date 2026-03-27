import { z } from 'zod';

export const createMonitorSchema = z.object({
  url: z.string().url('Invalid endpoint URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  interval: z.coerce.number().min(10, 'Minimum 10s interval').max(3600, 'Maximum 1h interval').default(60),
});
