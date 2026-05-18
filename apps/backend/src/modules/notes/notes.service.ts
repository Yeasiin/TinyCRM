import { db } from "@/db";
import { notes, activities } from "@/db/schema";
import { eq, and, isNull, desc, count, SQL } from "drizzle-orm";
import { AppError } from "@/lib/error-handler";
import type { CreateNoteInput } from "./notes.schema";

export interface ListNotesFilters {
  leadId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export async function listNotes(userId: string, filters: ListNotesFilters) {
  const { leadId, customerId, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(notes.userId, userId), isNull(notes.deletedAt)];

  if (leadId) conditions.push(eq(notes.leadId, leadId));
  if (customerId) conditions.push(eq(notes.customerId, customerId));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.notes.findMany({
      where,
      limit,
      offset,
      orderBy: desc(notes.createdAt),
      with: { author: true },
    }),
    db.select({ count: count() }).from(notes).where(where),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createNote(userId: string, input: CreateNoteInput) {
  const values: any = {
    userId,
    content: input.content,
  };

  if (input.leadId) values.leadId = input.leadId;
  if (input.customerId) values.customerId = input.customerId;

  const [note] = await db.insert(notes).values(values).returning();

  await db.insert(activities).values({
    userId,
    leadId: note.leadId,
    customerId: note.customerId,
    type: "note",
    description: `Note added`,
  });

  return note;
}

export async function deleteNote(userId: string, noteId: string) {
  const note = await db.query.notes.findFirst({
    where: and(eq(notes.id, noteId), eq(notes.userId, userId), isNull(notes.deletedAt)),
  });

  if (!note) throw new AppError("Note not found", 404);

  await db
    .update(notes)
    .set({ deletedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}
