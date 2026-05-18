import { db } from "@/db";
import { leads, activities, deals } from "@/db/schema";
import {
  eq,
  and,
  isNull,
  ilike,
  or,
  desc,
  count,
  SQL,
} from "drizzle-orm";
import { AppError } from "@/lib/error-handler";
import type { CreateLeadInput, UpdateLeadInput } from "./leads.schema";

export interface ListLeadsFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  assignedTo?: string;
}

export async function listLeads(userId: string, filters: ListLeadsFilters) {
  const { status, search, page = 1, limit = 20, assignedTo } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(leads.userId, userId), isNull(leads.deletedAt)];

  if (status) conditions.push(eq(leads.status, status as any));
  if (assignedTo) conditions.push(eq(leads.assignedTo, assignedTo));
  if (search) {
    const searchCondition = or(
      ilike(leads.name, `%${search}%`),
      ilike(leads.email, `%${search}%`),
      ilike(leads.company, `%${search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.leads.findMany({
      where,
      limit,
      offset,
      orderBy: desc(leads.createdAt),
      with: { assignee: true },
    }),
    db.select({ count: count() }).from(leads).where(where),
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

export async function getLead(userId: string, leadId: string) {
  const lead = await db.query.leads.findFirst({
    where: and(
      eq(leads.id, leadId),
      eq(leads.userId, userId),
      isNull(leads.deletedAt),
    ),
    with: { assignee: true },
  });

  if (!lead) throw new AppError("Lead not found", 404);
  return lead;
}

export async function createLead(userId: string, input: CreateLeadInput) {
  const values: any = {
    userId,
    name: input.name,
    status: input.status ?? "new",
  };

  if (input.email) values.email = input.email;
  if (input.phone) values.phone = input.phone;
  if (input.company) values.company = input.company;
  if (input.source) values.source = input.source;
  if (input.estimatedValue !== undefined) values.estimatedValue = input.estimatedValue;
  if (input.assignedTo) values.assignedTo = input.assignedTo;

  const [lead] = await db.insert(leads).values(values).returning();

  // Auto-create a deal for this lead so it appears in the pipeline
  await db.insert(deals).values({
    userId,
    leadId: lead.id,
    title: `${lead.name} - Deal`,
    stage: lead.status ?? "new",
    value: lead.estimatedValue,
    assignedTo: lead.assignedTo,
  });

  await db.insert(activities).values({
    userId,
    leadId: lead.id,
    type: "lead_created",
    description: `Lead "${lead.name}" was created`,
  });

  return lead;
}

export async function updateLead(
  userId: string,
  leadId: string,
  input: UpdateLeadInput,
) {
  const existing = await getLead(userId, leadId);

  const values: any = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.email !== undefined) values.email = input.email || null;
  if (input.phone !== undefined) values.phone = input.phone;
  if (input.company !== undefined) values.company = input.company;
  if (input.status !== undefined) values.status = input.status;
  if (input.source !== undefined) values.source = input.source;
  if (input.estimatedValue !== undefined) values.estimatedValue = input.estimatedValue;
  if (input.assignedTo !== undefined) values.assignedTo = input.assignedTo || null;

  const [updated] = await db
    .update(leads)
    .set(values)
    .where(and(eq(leads.id, leadId), eq(leads.userId, userId)))
    .returning();

  // Sync linked deal stage if status changed
  if (input.status && input.status !== existing.status) {
    await db
      .update(deals)
      .set({ stage: input.status as any })
      .where(and(eq(deals.leadId, leadId), eq(deals.userId, userId)));

    await db.insert(activities).values({
      userId,
      leadId,
      type: "status_change",
      description: `Lead status changed from ${existing.status} to ${input.status}`,
      metadata: { from: existing.status, to: input.status },
    });
  }

  await db.insert(activities).values({
    userId,
    leadId,
    type: "lead_updated",
    description: `Lead "${updated.name}" was updated`,
  });

  return updated;
}

export async function deleteLead(userId: string, leadId: string) {
  await getLead(userId, leadId);

  await db
    .update(leads)
    .set({ deletedAt: new Date() })
    .where(and(eq(leads.id, leadId), eq(leads.userId, userId)));

  // Soft-delete linked deals
  await db
    .update(deals)
    .set({ deletedAt: new Date() })
    .where(and(eq(deals.leadId, leadId), eq(deals.userId, userId)));

  await db.insert(activities).values({
    userId,
    leadId,
    type: "lead_deleted",
    description: "Lead was deleted",
  });
}
