import { db } from "@/db";
import { leads, customers, deals, tasks, activities } from "@/db/schema";
import { eq, and, isNull, count, sql, desc } from "drizzle-orm";

export async function getDashboardStats(userId: string) {
  // Lead counts by status
  const leadCounts = await db
    .select({
      status: leads.status,
      count: count(),
    })
    .from(leads)
    .where(and(eq(leads.userId, userId), isNull(leads.deletedAt)))
    .groupBy(leads.status);

  const leadStatusCounts: Record<string, number> = {};
  for (const row of leadCounts) {
    leadStatusCounts[row.status] = row.count;
  }

  // Total counts
  const [leadTotal] = await db
    .select({ count: count() })
    .from(leads)
    .where(and(eq(leads.userId, userId), isNull(leads.deletedAt)));

  const [customerTotal] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.userId, userId), isNull(customers.deletedAt)));

  const [dealTotal] = await db
    .select({ count: count() })
    .from(deals)
    .where(and(eq(deals.userId, userId), isNull(deals.deletedAt)));

  const [taskTotal] = await db
    .select({ count: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)));

  const [openTaskTotal] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        sql`${tasks.status} != 'done'`,
      ),
    );

  // Pipeline value by stage
  const pipelineValue = await db
    .select({
      stage: deals.stage,
      total: sql<number>`COALESCE(SUM(${deals.value}), 0)`,
      count: count(),
    })
    .from(deals)
    .where(and(eq(deals.userId, userId), isNull(deals.deletedAt)))
    .groupBy(deals.stage);

  const stageValues: Record<string, { total: number; count: number }> = {};
  for (const row of pipelineValue) {
    stageValues[row.stage] = {
      total: Number(row.total),
      count: row.count,
    };
  }

  // Won and lost metrics
  const [wonDeals] = await db
    .select({
      count: count(),
      value: sql<number>`COALESCE(SUM(${deals.value}), 0)`,
    })
    .from(deals)
    .where(
      and(
        eq(deals.userId, userId),
        isNull(deals.deletedAt),
        eq(deals.stage, "won" as any),
      ),
    );

  const [lostDeals] = await db
    .select({
      count: count(),
      value: sql<number>`COALESCE(SUM(${deals.value}), 0)`,
    })
    .from(deals)
    .where(
      and(
        eq(deals.userId, userId),
        isNull(deals.deletedAt),
        eq(deals.stage, "lost" as any),
      ),
    );

  // Recent activity
  const recentActivity = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
    orderBy: desc(activities.createdAt),
    limit: 10,
    with: {
      actor: true,
      lead: true,
      customer: true,
      deal: true,
    },
  });

  // Recent leads
  const recentLeads = await db.query.leads.findMany({
    where: and(eq(leads.userId, userId), isNull(leads.deletedAt)),
    orderBy: desc(leads.createdAt),
    limit: 5,
    with: { assignee: true },
  });

  return {
    counts: {
      leads: leadTotal.count,
      customers: customerTotal.count,
      deals: dealTotal.count,
      tasks: taskTotal.count,
      openTasks: openTaskTotal.count,
    },
    leadsByStatus: leadStatusCounts,
    pipeline: stageValues,
    won: {
      count: wonDeals.count,
      value: Number(wonDeals.value),
    },
    lost: {
      count: lostDeals.count,
      value: Number(lostDeals.value),
    },
    recentActivity,
    recentLeads,
  };
}
