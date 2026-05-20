import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { fetcher, API_URL } from "@/lib/api-client";
import type { Note, NotesResponse, CreateNoteInput } from "../types";

export function useNotes(filters: { leadId?: string; customerId?: string } = {}) {
  return useQuery<NotesResponse>({
    queryKey: queryKeys.notes.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.leadId) params.append("leadId", filters.leadId);
      if (filters.customerId) params.append("customerId", filters.customerId);

      return fetcher<NotesResponse>(
        `${API_URL}/api/crm/notes?${params.toString()}`,
      );
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, CreateNoteInput>({
    mutationFn: (data) =>
      fetcher<Note>(`${API_URL}/api/crm/notes`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      toast.success("Note added");
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      if (variables.leadId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.leads.detail(variables.leadId),
        });
      }
      if (variables.customerId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.customers.detail(variables.customerId),
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to add note", { description: error.message });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher<void>(`${API_URL}/api/crm/notes/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
    onError: (error) => {
      toast.error("Failed to delete note", { description: error.message });
    },
  });
}
