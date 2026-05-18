import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type { Attachment, AttachmentsResponse, PresignResponse } from "../types";

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

export function useAttachments(filters: { leadId?: string; customerId?: string; taskId?: string } = {}) {
  return useQuery<AttachmentsResponse>({
    queryKey: queryKeys.attachments.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.leadId) params.append("leadId", filters.leadId);
      if (filters.customerId) params.append("customerId", filters.customerId);
      if (filters.taskId) params.append("taskId", filters.taskId);

      return fetcher<AttachmentsResponse>(
        `${API_URL}/api/crm/attachments?${params.toString()}`,
      );
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation<PresignResponse, Error, { file: File; leadId?: string; customerId?: string; taskId?: string }>({
    mutationFn: async ({ file, leadId, customerId, taskId }) => {
      // Step 1: Get presigned URL
      const presignRes = await fetcher<PresignResponse>(`${API_URL}/api/crm/attachments/presign`, {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          leadId,
          customerId,
          taskId,
        }),
      });

      // Step 2: Upload to R2
      const uploadRes = await fetch(presignRes.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed");
      }

      // Step 3: Confirm upload
      await fetcher(`${API_URL}/api/crm/attachments/${presignRes.attachment.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({ size: file.size }),
      });

      return presignRes;
    },
    onSuccess: (_, variables) => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all });
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.leadId) });
      }
    },
    onError: (error) => {
      toast.error("Failed to upload file", { description: error.message });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher<void>(`${API_URL}/api/crm/attachments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all });
    },
    onError: (error) => {
      toast.error("Failed to delete file", { description: error.message });
    },
  });
}
