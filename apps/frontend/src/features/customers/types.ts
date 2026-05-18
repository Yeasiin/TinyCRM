export interface Customer {
  id: string;
  userId: string;
  assignedTo: string | null;
  leadId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    status: string;
  } | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  industry?: string;
  notes?: string;
  leadId?: string;
  assignedTo?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface ConvertLeadInput {
  leadId: string;
  notes?: string;
  address?: string;
  industry?: string;
}
