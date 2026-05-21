import { AppError } from "@/lib/error-handler";
import * as store from "@/lib/sheets-store";
import type { CreateLeadInput, UpdateLeadInput } from "./leads.schema";

export interface ListLeadsFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listLeads(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  filters: ListLeadsFilters,
) {
  const { status, search, page = 1, limit = 20 } = filters;
  const result = await store.list(accessToken, spreadsheetId, "Leads", {
    userId,
    status,
    search,
  }, {
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit,
  });
  return result;
}

export async function getLead(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  leadId: string,
) {
  const lead = await store.getById(accessToken, spreadsheetId, "Leads", leadId);
  if (!lead) {
    throw new AppError("Lead not found", 404);
  }
  if (lead.userId && lead.userId !== userId) {
    console.warn(`[getLead] userId mismatch for lead ${leadId}: expected ${userId}, got ${lead.userId}. Allowing access.`);
  }
  return lead;
}

export async function createLead(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  input: CreateLeadInput,
) {
  const lead = await store.create(accessToken, spreadsheetId, "Leads", {
    userId,
    name: input.name,
    status: input.status ?? "new",
    email: input.email || null,
    phone: input.phone || null,
    company: input.company || null,
    source: input.source || null,
    estimatedValue: input.estimatedValue ?? null,
  });

  // Auto-create a deal for this lead
  await store.create(accessToken, spreadsheetId, "Deals", {
    userId,
    leadId: lead.id,
    title: `${lead.name} - Deal`,
    stage: lead.status ?? "new",
    value: lead.estimatedValue ?? null,
    customerId: null,
    closedAt: null,
  });

  // Log activity
  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: lead.id,
    customerId: null,
    dealId: null,
    taskId: null,
    type: "lead_created",
    description: `Lead "${lead.name}" was created`,
    metadata: null,
  });

  return lead;
}

export async function updateLead(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  leadId: string,
  input: UpdateLeadInput,
) {
  const existing = await getLead(accessToken, spreadsheetId, userId, leadId);

  const updates: Record<string, any> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email || null;
  if (input.phone !== undefined) updates.phone = input.phone || null;
  if (input.company !== undefined) updates.company = input.company || null;
  if (input.status !== undefined) updates.status = input.status;
  if (input.source !== undefined) updates.source = input.source || null;
  if (input.estimatedValue !== undefined) updates.estimatedValue = input.estimatedValue;

  const updated = await store.update(
    accessToken,
    spreadsheetId,
    "Leads",
    leadId,
    updates,
  );

  // Sync linked deal if it exists
  const linkedDeal = await store.getByLeadId(
    accessToken,
    spreadsheetId,
    "Deals",
    leadId,
  );
  if (linkedDeal && !linkedDeal.deletedAt) {
    const dealUpdates: Record<string, any> = {};

    if (input.status && input.status !== existing.status) {
      dealUpdates.stage = input.status;
      if (["won", "lost"].includes(input.status)) {
        dealUpdates.closedAt = new Date().toISOString();
      }

      await store.create(accessToken, spreadsheetId, "Activities", {
        userId,
        leadId,
        customerId: null,
        dealId: linkedDeal.id,
        taskId: null,
        type: "status_change",
        description: `Lead status changed from ${existing.status} to ${input.status}`,
        metadata: JSON.stringify({ from: existing.status, to: input.status }),
      });
    }

    if (input.estimatedValue !== undefined && input.estimatedValue !== existing.estimatedValue) {
      dealUpdates.value = input.estimatedValue;
    }

    if (input.name !== undefined && input.name !== existing.name) {
      dealUpdates.title = `${input.name} - Deal`;
    }

    if (Object.keys(dealUpdates).length > 0) {
      await store.update(accessToken, spreadsheetId, "Deals", linkedDeal.id, dealUpdates);
    }
  }

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId,
    customerId: null,
    dealId: null,
    taskId: null,
    type: "lead_updated",
    description: `Lead "${updated.name}" was updated`,
    metadata: null,
  });

  return updated;
}

export async function deleteLead(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  leadId: string,
) {
  await getLead(accessToken, spreadsheetId, userId, leadId);

  await store.softDelete(accessToken, spreadsheetId, "Leads", leadId);

  // Soft-delete linked deals
  const linkedDeal = await store.getByLeadId(
    accessToken,
    spreadsheetId,
    "Deals",
    leadId,
  );
  if (linkedDeal && !linkedDeal.deletedAt) {
    await store.softDelete(accessToken, spreadsheetId, "Deals", linkedDeal.id);
  }

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId,
    customerId: null,
    dealId: null,
    taskId: null,
    type: "lead_deleted",
    description: "Lead was deleted",
    metadata: null,
  });
}
