export interface Attachment {
  id: string;
  userId: string;
  leadId: string | null;
  customerId: string | null;
  taskId: string | null;
  filename: string;
  r2Key: string;
  contentType: string | null;
  size: number | null;
  createdAt: string;
  downloadUrl?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AttachmentsResponse {
  data: Attachment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PresignResponse {
  attachment: Attachment;
  uploadUrl: string;
}
