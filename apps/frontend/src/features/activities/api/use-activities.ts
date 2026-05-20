import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetcher, API_URL } from "@/lib/api-client";
import type { ActivitiesResponse } from "../types";

export function useActivities(filters: { leadId?: string; customerId?: string } = {}) {
  return useQuery<ActivitiesResponse>({
    queryKey: queryKeys.activities.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.leadId) params.append("leadId", filters.leadId);
      if (filters.customerId) params.append("customerId", filters.customerId);

      return fetcher<ActivitiesResponse>(
        `${API_URL}/api/crm/activities?${params.toString()}`,
      );
    },
  });
}
