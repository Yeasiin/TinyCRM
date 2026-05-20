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
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  source: string | null;
  estimatedValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  search?: string;
  page?: number;
  limit?: number;
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
}

export type UpdateLeadInput = Partial<CreateLeadInput>;
