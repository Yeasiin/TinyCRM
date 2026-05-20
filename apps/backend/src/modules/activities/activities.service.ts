import * as store from "@/lib/sheets-store";

export interface ListActivitiesFilters {
  leadId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export async function listActivities(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  filters: ListActivitiesFilters,
) {
  const { leadId, customerId, page = 1, limit = 20 } = filters;
  const result = await store.list(accessToken, spreadsheetId, "Activities", {
    userId,
    leadId,
    customerId,
  }, {
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit,
  });
  return result;
}
