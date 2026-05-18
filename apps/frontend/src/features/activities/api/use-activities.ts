import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { ActivitiesResponse } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

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
