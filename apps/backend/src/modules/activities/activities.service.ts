import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, and, desc, count, SQL } from "drizzle-orm";

export interface ListActivitiesFilters {
  leadId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export async function listActivities(userId: string, filters: ListActivitiesFilters) {
  const { leadId, customerId, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(activities.userId, userId)];

  if (leadId) conditions.push(eq(activities.leadId, leadId));
  if (customerId) conditions.push(eq(activities.customerId, customerId));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.activities.findMany({
      where,
      limit,
      offset,
      orderBy: desc(activities.createdAt),
      with: {
        actor: true,
        lead: true,
        customer: true,
        deal: true,
      },
    }),
    db.select({ count: count() }).from(activities).where(where),
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
