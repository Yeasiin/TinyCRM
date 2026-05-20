export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  userId: string;
  leadId: string | null;
  customerId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
  } | null;
  customer?: {
    id: string;
    name: string;
  } | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  leadId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  leadId?: string;
  customerId?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;
