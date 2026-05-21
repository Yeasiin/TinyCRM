import { AppError } from "@/lib/error-handler";
import * as store from "@/lib/sheets-store";
import type { CreateCustomerInput, UpdateCustomerInput } from "./customers.schema";

export interface ListCustomersFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listCustomers(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  filters: ListCustomersFilters,
) {
  const { search, page = 1, limit = 20 } = filters;
  const result = await store.list(accessToken, spreadsheetId, "Customers", {
    userId,
    search,
  }, {
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit,
  });
  return result;
}

export async function getCustomer(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  customerId: string,
) {
  const customer = await store.getById(accessToken, spreadsheetId, "Customers", customerId);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }
  if (customer.userId && customer.userId !== userId) {
    console.warn(`[getCustomer] userId mismatch for customer ${customerId}: expected ${userId}, got ${customer.userId}. Allowing access.`);
  }
  return customer;
}

export async function createCustomer(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  input: CreateCustomerInput,
) {
  const customer = await store.create(accessToken, spreadsheetId, "Customers", {
    userId,
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    company: input.company || null,
    address: input.address || null,
    industry: input.industry || null,
    notes: input.notes || null,
    leadId: input.leadId || null,
  });

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: customer.leadId,
    customerId: customer.id,
    dealId: null,
    taskId: null,
    type: "customer_created",
    description: `Customer "${customer.name}" was created`,
    metadata: null,
  });

  return customer;
}

export async function convertLeadToCustomer(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  leadId: string,
  extra?: { notes?: string; address?: string; industry?: string },
) {
  const lead = await store.getById(accessToken, spreadsheetId, "Leads", leadId);
  if (!lead || lead.deletedAt) {
    throw new AppError("Lead not found", 404);
  }
  if (lead.userId && lead.userId !== userId) {
    console.warn(`[convertLeadToCustomer] userId mismatch for lead ${leadId}: expected ${userId}, got ${lead.userId}. Allowing access.`);
  }

  const customer = await store.create(accessToken, spreadsheetId, "Customers", {
    userId,
    leadId,
    name: lead.name,
    email: lead.email || null,
    phone: lead.phone || null,
    company: lead.company || null,
    notes: extra?.notes || null,
    address: extra?.address || null,
    industry: extra?.industry || null,
  });

  // Update lead status to won
  await store.update(accessToken, spreadsheetId, "Leads", leadId, {
    status: "won",
  });

  // Create a deal for the converted lead
  await store.create(accessToken, spreadsheetId, "Deals", {
    userId,
    leadId,
    customerId: customer.id,
    title: `${lead.name} - Deal`,
    stage: "won",
    value: lead.estimatedValue || null,
    closedAt: new Date().toISOString(),
  });

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId,
    customerId: customer.id,
    dealId: null,
    taskId: null,
    type: "lead_converted",
    description: `Lead "${lead.name}" was converted to customer`,
    metadata: null,
  });

  return customer;
}

export async function updateCustomer(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  customerId: string,
  input: UpdateCustomerInput,
) {
  await getCustomer(accessToken, spreadsheetId, userId, customerId);

  const updates: Record<string, any> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email || null;
  if (input.phone !== undefined) updates.phone = input.phone || null;
  if (input.company !== undefined) updates.company = input.company || null;
  if (input.address !== undefined) updates.address = input.address || null;
  if (input.industry !== undefined) updates.industry = input.industry || null;
  if (input.notes !== undefined) updates.notes = input.notes || null;

  const updated = await store.update(
    accessToken,
    spreadsheetId,
    "Customers",
    customerId,
    updates,
  );

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: updated.leadId,
    customerId,
    dealId: null,
    taskId: null,
    type: "customer_updated",
    description: `Customer "${updated.name}" was updated`,
    metadata: null,
  });

  return updated;
}

export async function deleteCustomer(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  customerId: string,
) {
  await getCustomer(accessToken, spreadsheetId, userId, customerId);

  await store.softDelete(accessToken, spreadsheetId, "Customers", customerId);

  await store.create(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId: null,
    customerId,
    dealId: null,
    taskId: null,
    type: "customer_updated",
    description: "Customer was deleted",
    metadata: null,
  });
}
