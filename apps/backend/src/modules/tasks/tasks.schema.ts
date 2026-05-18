import { z } from "zod";

export const taskStatusValues = ["todo", "in_progress", "done"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(taskStatusValues).default("todo"),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTasksQuerySchema = z.object({
  status: z.enum(taskStatusValues).optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
