import { db } from "@/db";
import { customers, leads, activities, deals } from "@/db/schema";
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
import type { CreateCustomerInput, UpdateCustomerInput } from "./customers.schema";

export interface ListCustomersFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listCustomers(userId: string, filters: ListCustomersFilters) {
  const { search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [
    eq(customers.userId, userId),
    isNull(customers.deletedAt),
  ];

  if (search) {
    const searchCondition = or(
      ilike(customers.name, `%${search}%`),
      ilike(customers.email, `%${search}%`),
      ilike(customers.company, `%${search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.customers.findMany({
      where,
      limit,
      offset,
      orderBy: desc(customers.createdAt),
      with: { lead: true, assignee: true },
    }),
    db.select({ count: count() }).from(customers).where(where),
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

export async function getCustomer(userId: string, customerId: string) {
  const customer = await db.query.customers.findFirst({
    where: and(
      eq(customers.id, customerId),
      eq(customers.userId, userId),
      isNull(customers.deletedAt),
    ),
    with: { lead: true, assignee: true },
  });

  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}

export async function createCustomer(userId: string, input: CreateCustomerInput) {
  const values: any = {
    userId,
    name: input.name,
  };

  if (input.email) values.email = input.email;
  if (input.phone) values.phone = input.phone;
  if (input.company) values.company = input.company;
  if (input.address) values.address = input.address;
  if (input.industry) values.industry = input.industry;
  if (input.notes) values.notes = input.notes;
  if (input.leadId) values.leadId = input.leadId;
  if (input.assignedTo) values.assignedTo = input.assignedTo;

  const [customer] = await db.insert(customers).values(values).returning();

  await db.insert(activities).values({
    userId,
    customerId: customer.id,
    leadId: customer.leadId,
    type: "customer_created",
    description: `Customer "${customer.name}" was created`,
  });

  return customer;
}

export async function convertLeadToCustomer(
  userId: string,
  leadId: string,
  extra?: { notes?: string; address?: string; industry?: string },
) {
  const lead = await db.query.leads.findFirst({
    where: and(eq(leads.id, leadId), eq(leads.userId, userId), isNull(leads.deletedAt)),
  });

  if (!lead) throw new AppError("Lead not found", 404);

  const [customer] = await db
    .insert(customers)
    .values({
      userId,
      leadId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: extra?.notes,
      address: extra?.address,
      industry: extra?.industry,
      assignedTo: lead.assignedTo,
    })
    .returning();

  // Update lead status to won
  await db
    .update(leads)
    .set({ status: "won" as any })
    .where(eq(leads.id, leadId));

  // Create a deal for the converted lead
  await db.insert(deals).values({
    userId,
    leadId,
    customerId: customer.id,
    title: `${lead.name} - Deal`,
    stage: "won" as any,
    value: lead.estimatedValue,
    assignedTo: lead.assignedTo,
  });

  await db.insert(activities).values({
    userId,
    leadId,
    customerId: customer.id,
    type: "lead_converted",
    description: `Lead "${lead.name}" was converted to customer`,
  });

  return customer;
}

export async function updateCustomer(
  userId: string,
  customerId: string,
  input: UpdateCustomerInput,
) {
  await getCustomer(userId, customerId);

  const values: any = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.email !== undefined) values.email = input.email || null;
  if (input.phone !== undefined) values.phone = input.phone;
  if (input.company !== undefined) values.company = input.company;
  if (input.address !== undefined) values.address = input.address;
  if (input.industry !== undefined) values.industry = input.industry;
  if (input.notes !== undefined) values.notes = input.notes;
  if (input.assignedTo !== undefined) values.assignedTo = input.assignedTo || null;

  const [updated] = await db
    .update(customers)
    .set(values)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
    .returning();

  await db.insert(activities).values({
    userId,
    customerId,
    type: "customer_updated",
    description: `Customer "${updated.name}" was updated`,
  });

  return updated;
}

export async function deleteCustomer(userId: string, customerId: string) {
  await getCustomer(userId, customerId);

  await db
    .update(customers)
    .set({ deletedAt: new Date() })
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)));

  await db.insert(activities).values({
    userId,
    customerId,
    type: "customer_updated",
    description: "Customer was deleted",
  });
}
