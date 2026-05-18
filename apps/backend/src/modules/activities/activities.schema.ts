import { z } from "zod";

export const listActivitiesQuerySchema = z.object({
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
