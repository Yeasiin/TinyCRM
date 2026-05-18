import { db } from "@/db";
import { tasks, activities } from "@/db/schema";
import {
  eq,
  and,
  isNull,
  desc,
  count,
  SQL,
} from "drizzle-orm";
import { AppError } from "@/lib/error-handler";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.schema";

export interface ListTasksFilters {
  status?: string;
  leadId?: string;
  customerId?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export async function listTasks(userId: string, filters: ListTasksFilters) {
  const { status, leadId, customerId, assignedTo, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(tasks.userId, userId), isNull(tasks.deletedAt)];

  if (status) conditions.push(eq(tasks.status, status as any));
  if (leadId) conditions.push(eq(tasks.leadId, leadId));
  if (customerId) conditions.push(eq(tasks.customerId, customerId));
  if (assignedTo) conditions.push(eq(tasks.assignedTo, assignedTo));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.tasks.findMany({
      where,
      limit,
      offset,
      orderBy: desc(tasks.createdAt),
      with: { lead: true, customer: true, assignee: true },
    }),
    db.select({ count: count() }).from(tasks).where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTask(userId: string, taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: and(
      eq(tasks.id, taskId),
      eq(tasks.userId, userId),
      isNull(tasks.deletedAt),
    ),
    with: { lead: true, customer: true, assignee: true },
  });

  if (!task) throw new AppError("Task not found", 404);
  return task;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const values: any = {
    userId,
    title: input.title,
    status: input.status ?? "todo",
  };

  if (input.description) values.description = input.description;
  if (input.dueDate) values.dueDate = new Date(input.dueDate);
  if (input.leadId) values.leadId = input.leadId;
  if (input.customerId) values.customerId = input.customerId;
  if (input.assignedTo) values.assignedTo = input.assignedTo;

  const [task] = await db.insert(tasks).values(values).returning();

  await db.insert(activities).values({
    userId,
    taskId: task.id,
    leadId: task.leadId,
    customerId: task.customerId,
    type: "task_created",
    description: `Task "${task.title}" was created`,
  });

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  const existing = await getTask(userId, taskId);

  const values: any = {};
  if (input.title !== undefined) values.title = input.title;
  if (input.description !== undefined) values.description = input.description;
  if (input.dueDate !== undefined) values.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.status !== undefined) values.status = input.status;
  if (input.leadId !== undefined) values.leadId = input.leadId || null;
  if (input.customerId !== undefined) values.customerId = input.customerId || null;
  if (input.assignedTo !== undefined) values.assignedTo = input.assignedTo || null;

  const [updated] = await db
    .update(tasks)
    .set(values)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (input.status && input.status !== existing.status && input.status === "done") {
    await db.insert(activities).values({
      userId,
      leadId: updated.leadId,
      customerId: updated.customerId,
      type: "task_completed",
      description: `Task "${updated.title}" was completed`,
    });
  }

  return updated;
}

export async function deleteTask(userId: string, taskId: string) {
  await getTask(userId, taskId);

  await db
    .update(tasks)
    .set({ deletedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}
