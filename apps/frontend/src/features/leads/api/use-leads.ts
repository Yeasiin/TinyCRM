import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { fetcher, API_URL } from "@/lib/api-client";
import type {
  Lead,
  LeadFilters,
  LeadsResponse,
  CreateLeadInput,
  UpdateLeadInput,
} from "../types";

export function useLeads(filters: LeadFilters = {}) {
  return useQuery<LeadsResponse>({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      return fetcher<LeadsResponse>(
        `${API_URL}/api/crm/leads?${params.toString()}`,
      );
    },
  });
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => fetcher<Lead>(`${API_URL}/api/crm/leads/${id}`),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, CreateLeadInput>({
    mutationFn: (data) =>
      fetcher<Lead>(`${API_URL}/api/crm/leads`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Lead created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
    },
    onError: (error) => {
      toast.error("Failed to create lead", { description: error.message });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, { id: string; data: UpdateLeadInput }>({
    mutationFn: ({ id, data }) =>
      fetcher<Lead>(`${API_URL}/api/crm/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      toast.success("Lead updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
    },
    onError: (error) => {
      toast.error("Failed to update lead", { description: error.message });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher<void>(`${API_URL}/api/crm/leads/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Lead deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
    },
    onError: (error) => {
      toast.error("Failed to delete lead", { description: error.message });
    },
  });
}
