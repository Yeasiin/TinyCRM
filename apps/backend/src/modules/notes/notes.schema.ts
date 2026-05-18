import { z } from "zod";

export const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

export const listNotesQuerySchema = z.object({
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
