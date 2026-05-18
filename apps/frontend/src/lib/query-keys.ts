export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
    user: ["auth", "user"] as const,
  },
  leads: {
    all: ["leads"] as const,
    list: (filters: Record<string, any>) => ["leads", "list", filters] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
  pipeline: {
    all: ["pipeline"] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters: Record<string, any>) => ["customers", "list", filters] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (filters: Record<string, any>) => ["tasks", "list", filters] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  notes: {
    all: ["notes"] as const,
    list: (filters: Record<string, any>) => ["notes", "list", filters] as const,
  },
  activities: {
    all: ["activities"] as const,
    list: (filters: Record<string, any>) => ["activities", "list", filters] as const,
  },
  attachments: {
    all: ["attachments"] as const,
    list: (filters: Record<string, any>) => ["attachments", "list", filters] as const,
  },
} as const;
