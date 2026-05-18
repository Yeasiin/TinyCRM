export interface Activity {
  id: string;
  userId: string;
  leadId: string | null;
  customerId: string | null;
  dealId: string | null;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  lead?: {
    id: string;
    name: string;
  } | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  deal?: {
    id: string;
    title: string;
  } | null;
}

export interface ActivitiesResponse {
  data: Activity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
