import * as store from "@/lib/sheets-store";

export async function getDashboardStats(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
) {
  // Load all data in parallel
  const [
    leadsResult,
    customersResult,
    dealsResult,
    tasksResult,
    activitiesResult,
  ] = await Promise.all([
    store.list(accessToken, spreadsheetId, "Leads", {}, { sortBy: "createdAt", sortOrder: "desc" }),
    store.list(accessToken, spreadsheetId, "Customers", {}, { sortBy: "createdAt", sortOrder: "desc" }),
    store.list(accessToken, spreadsheetId, "Deals", {}, { sortBy: "createdAt", sortOrder: "desc" }),
    store.list(accessToken, spreadsheetId, "Tasks", {}, { sortBy: "createdAt", sortOrder: "desc" }),
    store.list(accessToken, spreadsheetId, "Activities", {}, { sortBy: "createdAt", sortOrder: "desc" }),
  ]);

  const leadList = leadsResult.data;
  const customerList = customersResult.data;
  const dealList = dealsResult.data;
  const taskList = tasksResult.data;
  const activityList = activitiesResult.data;

  // Counts
  const leadTotal = leadList.length;
  const customerTotal = customerList.length;
  const dealTotal = dealList.length;
  const taskTotal = taskList.length;
  const openTaskTotal = taskList.filter((t: any) => t.status !== "done").length;

  // Leads by status
  const leadStatusCounts: Record<string, number> = {};
  for (const lead of leadList) {
    const status = lead.status as string;
    leadStatusCounts[status] = (leadStatusCounts[status] ?? 0) + 1;
  }

  // Pipeline by stage
  const stageValues: Record<string, { total: number; count: number }> = {};
  for (const deal of dealList) {
    const stage = deal.stage as string;
    const value = typeof deal.value === "number" ? deal.value : 0;
    if (!stageValues[stage]) {
      stageValues[stage] = { total: 0, count: 0 };
    }
    stageValues[stage].total += value;
    stageValues[stage].count += 1;
  }

  // Won / Lost metrics
  const wonDeals = dealList.filter((d: any) => d.stage === "won");
  const lostDeals = dealList.filter((d: any) => d.stage === "lost");
  const wonValue = wonDeals.reduce((sum: number, d: any) => sum + (typeof d.value === "number" ? d.value : 0), 0);
  const lostValue = lostDeals.reduce((sum: number, d: any) => sum + (typeof d.value === "number" ? d.value : 0), 0);

  // Recent activity (top 10)
  const recentActivity = activityList.slice(0, 10).map((a: any) => ({
    id: a.id,
    userId: a.userId,
    leadId: a.leadId ?? null,
    customerId: a.customerId ?? null,
    dealId: a.dealId ?? null,
    type: a.type,
    description: a.description,
    metadata: a.metadata ? (typeof a.metadata === "string" ? JSON.parse(a.metadata) : a.metadata) : null,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  }));

  // Recent leads (top 5)
  const recentLeads = leadList.slice(0, 5).map((l: any) => ({
    id: l.id,
    name: l.name,
    email: l.email ?? null,
    company: l.company ?? null,
    status: l.status,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
  }));

  return {
    counts: {
      leads: leadTotal,
      customers: customerTotal,
      deals: dealTotal,
      tasks: taskTotal,
      openTasks: openTaskTotal,
    },
    leadsByStatus: leadStatusCounts,
    pipeline: stageValues,
    won: {
      count: wonDeals.length,
      value: wonValue,
    },
    lost: {
      count: lostDeals.length,
      value: lostValue,
    },
    recentActivity,
    recentLeads,
  };
}
