import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type {
  Customer,
  CustomerFilters,
  CustomersResponse,
  CreateCustomerInput,
  UpdateCustomerInput,
  ConvertLeadInput,
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

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery<CustomersResponse>({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      return fetcher<CustomersResponse>(
        `${API_URL}/api/crm/customers?${params.toString()}`,
      );
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => fetcher<Customer>(`${API_URL}/api/crm/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, CreateCustomerInput>({
    mutationFn: (data) =>
      fetcher<Customer>(`${API_URL}/api/crm/customers`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Customer created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
    onError: (error) => {
      toast.error("Failed to create customer", { description: error.message });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, ConvertLeadInput>({
    mutationFn: (data) =>
      fetcher<Customer>(`${API_URL}/api/crm/customers/convert`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Lead converted to customer");
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
    },
    onError: (error) => {
      toast.error("Failed to convert lead", { description: error.message });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, Error, { id: string; data: UpdateCustomerInput }>({
    mutationFn: ({ id, data }) =>
      fetcher<Customer>(`${API_URL}/api/crm/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      toast.success("Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error("Failed to update customer", { description: error.message });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher<void>(`${API_URL}/api/crm/customers/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
    onError: (error) => {
      toast.error("Failed to delete customer", { description: error.message });
    },
  });
}
