import { AppError } from "@/lib/error-handler";
import * as store from "@/lib/sheets-store";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.schema";

export interface ListTasksFilters {
  status?: string;
  leadId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export async function listTasks(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  filters: ListTasksFilters,
) {
  const { status, leadId, customerId, page = 1, limit = 20 } = filters;
  const result = await store.list(accessToken, spreadsheetId, "Tasks", {
    status,
    leadId,
    customerId,
  }, {
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit,
  });
  return result;
}

export async function getTask(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  taskId: string,
) {
  const task = await store.getById(accessToken, spreadsheetId, "Tasks", taskId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  if (task.userId && task.userId !== userId) {
    console.warn(`[getTask] userId mismatch for task ${taskId}: expected ${userId}, got ${task.userId}. Allowing access.`);
  }
  return task;
}

export async function createTask(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  input: CreateTaskInput,
) {
  const task = await store.create(accessToken, spreadsheetId, "Tasks", {
    userId,
    title: input.title,
    status: input.status ?? "todo",
    description: input.description || null,
    dueDate: input.dueDate || null,
    leadId: input.leadId || null,
    customerId: input.customerId || null,
  });

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: task.leadId,
    customerId: task.customerId,
    dealId: null,
    taskId: task.id,
    type: "task_created",
    description: `Task "${task.title}" was created`,
    metadata: null,
  });

  return task;
}

export async function updateTask(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  const existing = await getTask(accessToken, spreadsheetId, userId, taskId);

  const updates: Record<string, any> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description || null;
  if (input.dueDate !== undefined) updates.dueDate = input.dueDate || null;
  if (input.status !== undefined) updates.status = input.status;
  if (input.leadId !== undefined) updates.leadId = input.leadId || null;
  if (input.customerId !== undefined) updates.customerId = input.customerId || null;

  const updated = await store.update(
    accessToken,
    spreadsheetId,
    "Tasks",
    taskId,
    updates,
  );

  if (input.status && input.status !== existing.status && input.status === "done") {
    await store.create(accessToken, spreadsheetId, "Activities", {
      userId,
      leadId: updated.leadId,
      customerId: updated.customerId,
      dealId: null,
      taskId,
      type: "task_completed",
      description: `Task "${updated.title}" was completed`,
      metadata: null,
    });
  }

  return updated;
}

export async function deleteTask(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  taskId: string,
) {
  await getTask(accessToken, spreadsheetId, userId, taskId);
  await store.softDelete(accessToken, spreadsheetId, "Tasks", taskId);
}
