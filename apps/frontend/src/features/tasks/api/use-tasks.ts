import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { fetcher, API_URL } from "@/lib/api-client";
import type {
  Task,
  TaskFilters,
  TasksResponse,
  CreateTaskInput,
  UpdateTaskInput,
} from "../types";

export function useTasks(filters: TaskFilters = {}) {
  return useQuery<TasksResponse>({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.leadId) params.append("leadId", filters.leadId);
      if (filters.customerId) params.append("customerId", filters.customerId);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      return fetcher<TasksResponse>(
        `${API_URL}/api/crm/tasks?${params.toString()}`,
      );
    },
  });
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => fetcher<Task>(`${API_URL}/api/crm/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: (data) =>
      fetcher<Task>(`${API_URL}/api/crm/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error("Failed to create task", { description: error.message });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: string; data: UpdateTaskInput }>({
    mutationFn: ({ id, data }) =>
      fetcher<Task>(`${API_URL}/api/crm/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error("Failed to update task", { description: error.message });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher<void>(`${API_URL}/api/crm/tasks/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error("Failed to delete task", { description: error.message });
    },
  });
}
