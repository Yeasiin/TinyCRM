import { relations } from "drizzle-orm";
import {
  user,
  leads,
  customers,
  deals,
  tasks,
  notes,
  activities,
  attachments,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  leads: many(leads),
  customers: many(customers),
  deals: many(deals),
  tasks: many(tasks),
  notes: many(notes),
  activities: many(activities),
  attachments: many(attachments),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  owner: one(user, { fields: [leads.userId], references: [user.id] }),
  assignee: one(user, {
    fields: [leads.assignedTo],
    references: [user.id],
  }),
  customer: one(customers),
  deals: many(deals),
  tasks: many(tasks),
  notes: many(notes),
  activities: many(activities),
  attachments: many(attachments),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  lead: one(leads, {
    fields: [customers.leadId],
    references: [leads.id],
  }),
  owner: one(user, { fields: [customers.userId], references: [user.id] }),
  assignee: one(user, {
    fields: [customers.assignedTo],
    references: [user.id],
  }),
  deals: many(deals),
  tasks: many(tasks),
  notes: many(notes),
  activities: many(activities),
  attachments: many(attachments),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  lead: one(leads, { fields: [deals.leadId], references: [leads.id] }),
  customer: one(customers, {
    fields: [deals.customerId],
    references: [customers.id],
  }),
  owner: one(user, { fields: [deals.userId], references: [user.id] }),
  assignee: one(user, {
    fields: [deals.assignedTo],
    references: [user.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  owner: one(user, { fields: [tasks.userId], references: [user.id] }),
  assignee: one(user, {
    fields: [tasks.assignedTo],
    references: [user.id],
  }),
  lead: one(leads, { fields: [tasks.leadId], references: [leads.id] }),
  customer: one(customers, {
    fields: [tasks.customerId],
    references: [customers.id],
  }),
  attachments: many(attachments),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  author: one(user, { fields: [notes.userId], references: [user.id] }),
  lead: one(leads, { fields: [notes.leadId], references: [leads.id] }),
  customer: one(customers, {
    fields: [notes.customerId],
    references: [customers.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  actor: one(user, { fields: [activities.userId], references: [user.id] }),
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  customer: one(customers, {
    fields: [activities.customerId],
    references: [customers.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  task: one(tasks, {
    fields: [activities.taskId],
    references: [tasks.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  owner: one(user, { fields: [attachments.userId], references: [user.id] }),
  lead: one(leads, {
    fields: [attachments.leadId],
    references: [leads.id],
  }),
  customer: one(customers, {
    fields: [attachments.customerId],
    references: [customers.id],
  }),
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));
