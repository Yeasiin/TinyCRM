export interface DashboardStats {
  counts: {
    leads: number;
    customers: number;
    deals: number;
    tasks: number;
    openTasks: number;
  };
  leadsByStatus: Record<string, number>;
  pipeline: Record<string, { total: number; count: number }>;
  won: {
    count: number;
    value: number;
  };
  lost: {
    count: number;
    value: number;
  };
  recentActivity: ActivityItem[];
  recentLeads: LeadItem[];
}

export interface ActivityItem {
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

export interface LeadItem {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  status: string;
  createdAt: string;
  assignee?: {
    id: string;
    name: string;
  } | null;
}
