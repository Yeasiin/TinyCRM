import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetcher, API_URL } from "@/lib/api-client";
import type { DashboardStats } from "../types";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => fetcher<DashboardStats>(`${API_URL}/api/crm/dashboard/stats`),
  });
}
