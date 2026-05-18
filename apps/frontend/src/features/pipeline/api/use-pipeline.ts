import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type {
  PipelineResponse,
  PipelineDeal,
  UpdateDealStageInput,
} from "../types";

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

export function usePipeline() {
  return useQuery<PipelineResponse>({
    queryKey: queryKeys.pipeline.all,
    queryFn: () => fetcher<PipelineResponse>(`${API_URL}/api/crm/deals/pipeline`),
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation<PipelineDeal, Error, { id: string; data: UpdateDealStageInput }>({
    mutationFn: ({ id, data }) =>
      fetcher<PipelineDeal>(`${API_URL}/api/crm/deals/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
    onError: (error) => {
      toast.error("Failed to move deal", { description: error.message });
    },
  });
}
