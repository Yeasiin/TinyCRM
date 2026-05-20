import { z } from "zod";
import { leadStatusValues } from "../leads/leads.schema";

export const createDealSchema = z.object({
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(200),
  stage: z.enum(leadStatusValues).default("new"),
  value: z.coerce.number().int().min(0).optional(),
});

export const updateDealStageSchema = z.object({
  stage: z.enum(leadStatusValues),
});

export const listDealsQuerySchema = z.object({
  stage: z.enum(leadStatusValues).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
