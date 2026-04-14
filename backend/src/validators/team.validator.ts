import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(3, "Organization name must be at least 3 characters").max(100, "Organization name cannot exceed 100 characters"),
});

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"], { message: "Role must be 'admin' or 'member'" }),
});
