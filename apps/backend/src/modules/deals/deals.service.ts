import { db } from "@/db";
import { deals, activities, leads } from "@/db/schema";
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
import type { CreateDealInput, UpdateDealStageInput } from "./deals.schema";

export interface ListDealsFilters {
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listDeals(userId: string, filters: ListDealsFilters) {
  const { stage, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(deals.userId, userId), isNull(deals.deletedAt)];

  if (stage) conditions.push(eq(deals.stage, stage as any));
  if (search) {
    const searchCondition = or(
      ilike(deals.title, `%${search}%`),
      ilike(leads.name, `%${search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.deals.findMany({
      where,
      limit,
      offset,
      orderBy: desc(deals.createdAt),
      with: { lead: true, customer: true, assignee: true },
    }),
    db.select({ count: count() }).from(deals).where(where),
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

export async function getPipeline(userId: string) {
  const dealList = await db.query.deals.findMany({
    where: and(eq(deals.userId, userId), isNull(deals.deletedAt)),
    orderBy: desc(deals.updatedAt),
    with: { lead: true, customer: true, assignee: true },
  });

  const stages = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ] as const;

  const columns = stages.map((stage) => ({
    id: stage,
    title: stage.charAt(0).toUpperCase() + stage.slice(1),
    deals: dealList.filter((d) => d.stage === stage),
  }));

  return { columns };
}

export async function getDeal(userId: string, dealId: string) {
  const deal = await db.query.deals.findFirst({
    where: and(
      eq(deals.id, dealId),
      eq(deals.userId, userId),
      isNull(deals.deletedAt),
    ),
    with: { lead: true, customer: true, assignee: true },
  });

  if (!deal) throw new AppError("Deal not found", 404);
  return deal;
}

export async function createDeal(userId: string, input: CreateDealInput) {
  const values: any = {
    userId,
    title: input.title,
    stage: input.stage ?? "new",
  };

  if (input.leadId) values.leadId = input.leadId;
  if (input.customerId) values.customerId = input.customerId;
  if (input.value !== undefined) values.value = input.value;
  if (input.assignedTo) values.assignedTo = input.assignedTo;

  const [deal] = await db.insert(deals).values(values).returning();

  await db.insert(activities).values({
    userId,
    dealId: deal.id,
    leadId: deal.leadId,
    customerId: deal.customerId,
    type: "deal_created",
    description: `Deal "${deal.title}" was created`,
  });

  return deal;
}

export async function updateDealStage(
  userId: string,
  dealId: string,
  input: UpdateDealStageInput,
) {
  const existing = await getDeal(userId, dealId);

  const [updated] = await db
    .update(deals)
    .set({
      stage: input.stage,
      closedAt: ["won", "lost"].includes(input.stage) ? new Date() : existing.closedAt,
    })
    .where(and(eq(deals.id, dealId), eq(deals.userId, userId)))
    .returning();

  await db.insert(activities).values({
    userId,
    dealId,
    leadId: existing.leadId,
    customerId: existing.customerId,
    type: "deal_updated",
    description: `Deal moved to ${input.stage}`,
    metadata: { from: existing.stage, to: input.stage },
  });

  // Also update the linked lead status if exists
  if (existing.leadId) {
    await db
      .update(leads)
      .set({ status: input.stage as any })
      .where(eq(leads.id, existing.leadId));
  }

  return updated;
}

export async function deleteDeal(userId: string, dealId: string) {
  const existing = await getDeal(userId, dealId);

  await db
    .update(deals)
    .set({ deletedAt: new Date() })
    .where(and(eq(deals.id, dealId), eq(deals.userId, userId)));

  await db.insert(activities).values({
    userId,
    dealId,
    leadId: existing.leadId,
    customerId: existing.customerId,
    type: "deal_updated",
    description: "Deal was deleted",
  });
}
