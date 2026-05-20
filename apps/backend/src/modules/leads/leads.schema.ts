import { z } from "zod";

export const leadStatusValues = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  status: z.enum(leadStatusValues).optional(),
  source: z.string().max(100).optional(),
  estimatedValue: z.coerce.number().int().min(0).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const listLeadsQuerySchema = z.object({
  status: z.enum(leadStatusValues).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
