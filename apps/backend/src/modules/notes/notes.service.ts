import { AppError } from "@/lib/error-handler";
import * as store from "@/lib/sheets-store";
import type { CreateNoteInput } from "./notes.schema";

export interface ListNotesFilters {
  leadId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export async function listNotes(
  accessToken: string,
  spreadsheetId: string,
  filters: ListNotesFilters,
) {
  const { leadId, customerId, page = 1, limit = 20 } = filters;
  const result = await store.list(accessToken, spreadsheetId, "Notes", {
    leadId,
    customerId,
  }, {
    sortBy: "createdAt",
    sortOrder: "desc",
    page,
    limit,
  });
  return result;
}

export async function createNote(
  accessToken: string,
  spreadsheetId: string,
  input: CreateNoteInput,
) {
  const note = await store.create(accessToken, spreadsheetId, "Notes", {
    content: input.content,
    leadId: input.leadId || null,
    customerId: input.customerId || null,
  });

  await store.create(accessToken, spreadsheetId, "Activities", {
    leadId: note.leadId,
    customerId: note.customerId,
    dealId: null,
    taskId: null,
    type: "note",
    description: "Note added",
    metadata: null,
  });

  return note;
}

export async function deleteNote(
  accessToken: string,
  spreadsheetId: string,
  noteId: string,
) {
  const note = await store.getById(accessToken, spreadsheetId, "Notes", noteId);
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  await store.softDelete(accessToken, spreadsheetId, "Notes", noteId);
}
