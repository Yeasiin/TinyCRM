export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Lead {
  id: string;
  userId: string;
  assignedTo: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  source: string | null;
  estimatedValue: number | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface LeadFilters {
  status?: LeadStatus;
  search?: string;
  page?: number;
  limit?: number;
  assignedTo?: string;
}

export interface LeadsResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: LeadStatus;
  source?: string;
  estimatedValue?: number;
  assignedTo?: string;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;
