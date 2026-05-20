import { AppError } from "@/lib/error-handler";
import * as store from "@/lib/sheets-store";
import type { CreateDealInput, UpdateDealStageInput } from "./deals.schema";

export interface ListDealsFilters {
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listDeals(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  filters: ListDealsFilters,
) {
  const { stage, search, page = 1, limit = 20 } = filters;
  const result = await store.list(accessToken, spreadsheetId, "Deals", {
    userId,
    stage,
    search,
  }, {
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit,
  });
  return result;
}

export async function getPipeline(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
) {
  const { data: dealList } = await store.list(accessToken, spreadsheetId, "Deals", {
    userId,
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
    deals: dealList.filter((d: any) => d.stage === stage),
  }));

  return { columns };
}

export async function getDeal(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  dealId: string,
) {
  const deal = await store.getById(accessToken, spreadsheetId, "Deals", dealId);
  if (!deal || deal.userId !== userId) {
    throw new AppError("Deal not found", 404);
  }
  return deal;
}

export async function createDeal(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  input: CreateDealInput,
) {
  const deal = await store.create(accessToken, spreadsheetId, "Deals", {
    userId,
    title: input.title,
    stage: input.stage ?? "new",
    leadId: input.leadId || null,
    customerId: input.customerId || null,
    value: input.value ?? null,
    closedAt: null,
  });

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: deal.leadId,
    customerId: deal.customerId,
    dealId: deal.id,
    taskId: null,
    type: "deal_created",
    description: `Deal "${deal.title}" was created`,
    metadata: null,
  });

  return deal;
}

export async function updateDealStage(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  dealId: string,
  input: UpdateDealStageInput,
) {
  const existing = await getDeal(accessToken, spreadsheetId, userId, dealId);

  const updates: Record<string, any> = {
    stage: input.stage,
  };
  if (["won", "lost"].includes(input.stage)) {
    updates.closedAt = new Date().toISOString();
  }

  const updated = await store.update(
    accessToken,
    spreadsheetId,
    "Deals",
    dealId,
    updates,
  );

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: existing.leadId,
    customerId: existing.customerId,
    dealId,
    taskId: null,
    type: "deal_updated",
    description: `Deal moved to ${input.stage}`,
    metadata: JSON.stringify({ from: existing.stage, to: input.stage }),
  });

  // Also update the linked lead status if exists
  if (existing.leadId) {
    await store.update(accessToken, spreadsheetId, "Leads", existing.leadId, {
      status: input.stage,
    });
  }

  return updated;
}

export async function deleteDeal(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  dealId: string,
) {
  const existing = await getDeal(accessToken, spreadsheetId, userId, dealId);

  await store.softDelete(accessToken, spreadsheetId, "Deals", dealId);

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: existing.leadId,
    customerId: existing.customerId,
    dealId,
    taskId: null,
    type: "deal_updated",
    description: "Deal was deleted",
    metadata: null,
  });
}
