import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { fetcher, API_URL } from "@/lib/api-client";
import type {
  PipelineResponse,
  PipelineDeal,
  UpdateDealStageInput,
} from "../types";

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
