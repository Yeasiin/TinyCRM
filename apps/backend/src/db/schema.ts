import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  uuid,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ------------------------------------------------------------------
// Auth tables (managed by Better Auth)
// ------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "note",
  "status_change",
  "task_created",
  "task_completed",
  "lead_created",
  "lead_updated",
  "lead_deleted",
  "lead_converted",
  "customer_created",
  "customer_updated",
  "deal_created",
  "deal_updated",
]);

// ------------------------------------------------------------------
// CRM tables
// ------------------------------------------------------------------

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    status: leadStatusEnum("status").default("new").notNull(),
    source: text("source"),
    estimatedValue: integer("estimated_value"), // stored in cents
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("leads_userId_idx").on(table.userId),
    index("leads_status_idx").on(table.status),
    index("leads_assignedTo_idx").on(table.assignedTo),
    index("leads_deletedAt_idx").on(table.deletedAt),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    address: text("address"),
    industry: text("industry"),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customers_userId_idx").on(table.userId),
    index("customers_leadId_idx").on(table.leadId),
    index("customers_deletedAt_idx").on(table.deletedAt),
  ],
);

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    stage: leadStatusEnum("stage").default("new").notNull(),
    value: integer("value"), // cents
    closedAt: timestamp("closed_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("deals_userId_idx").on(table.userId),
    index("deals_stage_idx").on(table.stage),
    index("deals_leadId_idx").on(table.leadId),
    index("deals_customerId_idx").on(table.customerId),
    index("deals_deletedAt_idx").on(table.deletedAt),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "cascade",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date"),
    status: taskStatusEnum("status").default("todo").notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tasks_userId_idx").on(table.userId),
    index("tasks_assignedTo_idx").on(table.assignedTo),
    index("tasks_leadId_idx").on(table.leadId),
    index("tasks_customerId_idx").on(table.customerId),
    index("tasks_status_idx").on(table.status),
    index("tasks_deletedAt_idx").on(table.deletedAt),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "cascade",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("notes_userId_idx").on(table.userId),
    index("notes_leadId_idx").on(table.leadId),
    index("notes_customerId_idx").on(table.customerId),
    index("notes_deletedAt_idx").on(table.deletedAt),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "cascade",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    dealId: uuid("deal_id").references(() => deals.id, {
      onDelete: "cascade",
    }),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    type: activityTypeEnum("type").notNull(),
    description: text("description").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("activities_userId_idx").on(table.userId),
    index("activities_leadId_idx").on(table.leadId),
    index("activities_customerId_idx").on(table.customerId),
    index("activities_dealId_idx").on(table.dealId),
    index("activities_taskId_idx").on(table.taskId),
    index("activities_type_idx").on(table.type),
    index("activities_createdAt_idx").on(table.createdAt),
  ],
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "cascade",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    filename: text("filename").notNull(),
    r2Key: text("r2_key").notNull().unique(),
    contentType: text("content_type"),
    size: integer("size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("attachments_userId_idx").on(table.userId),
    index("attachments_leadId_idx").on(table.leadId),
    index("attachments_customerId_idx").on(table.customerId),
    index("attachments_taskId_idx").on(table.taskId),
  ],
);
