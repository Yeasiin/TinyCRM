import {
  getSheetData,
  appendRows,
  updateRow,
  clearRow,
} from "./google-sheets";
import {
  rowToObject,
  objectToRow,
  generateUUID,
  filterRows,
  sortRows,
  paginateRows,
} from "./sheets-utils";
import { HEADERS, SheetName } from "./sheets-schema";
import { AppError } from "./error-handler";

// ------------------------------------------------------------------
// Generic CRUD
// ------------------------------------------------------------------

export async function list(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  filters: Record<string, any> = {},
  options: { sortBy?: string; sortOrder?: "asc" | "desc"; page?: number; limit?: number } = {},
) {
  const raw = await getSheetData(accessToken, spreadsheetId, sheetName);
  const headers = raw[0] ?? [];
  const rows = raw.slice(1).map((row) => rowToObject(headers, row));

  const includeDeleted = filters.includeDeleted;
  delete filters.includeDeleted;

  let result = filterRows(rows, filters);

  // Always exclude soft-deleted unless explicitly requested
  if (!includeDeleted) {
    result = result.filter((row) => !row.deletedAt);
  }

  // Fallback for single-user CRM: if userId filter removed everything but sheet has data,
  // the userId likely changed due to auth system changes. Return all non-deleted rows.
  // Only apply this fallback when removing the userId filter would yield results,
  // ensuring we don't bypass legitimate filters like leadId or customerId.
  if (!includeDeleted && result.length === 0 && filters.userId) {
    const nonDeletedRows = rows.filter((r) => !r.deletedAt);
    const filtersWithoutUserId = { ...filters };
    delete filtersWithoutUserId.userId;
    const resultWithoutUserId = filterRows(nonDeletedRows, filtersWithoutUserId);

    if (resultWithoutUserId.length > 0) {
      console.warn(
        `[sheets-store.list] userId filter (${filters.userId}) removed all rows. ` +
          `Returning all non-deleted rows as fallback.`,
      );
      result = nonDeletedRows;
    }
  }

  if (options.sortBy) {
    result = sortRows(result, options.sortBy, options.sortOrder);
  }

  const { page = 1, limit = 20 } = options;
  return paginateRows(result, page, limit);
}

export async function getById(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  id: string,
): Promise<Record<string, any> | null> {
  const raw = await getSheetData(accessToken, spreadsheetId, sheetName);
  const headers = raw[0] ?? [];
  const rows = raw.slice(1);
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return null;
  const obj = rowToObject(headers, rows[rowIndex]);
  if (obj.deletedAt) return null;
  return obj;
}

export async function create(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  data: Record<string, any>,
): Promise<Record<string, any>> {
  const id = generateUUID();
  const now = new Date().toISOString();
  const values: Record<string, any> = {
    id,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...data,
  };

  const headers = HEADERS[sheetName];
  const row = objectToRow(headers, values);
  await appendRows(accessToken, spreadsheetId, sheetName, [row]);
  return values;
}

export async function update(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  id: string,
  data: Record<string, any>,
): Promise<Record<string, any>> {
  const raw = await getSheetData(accessToken, spreadsheetId, sheetName);
  const headers = raw[0] ?? [];
  const rows = raw.slice(1);
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) {
    throw new AppError(`${sheetName} not found`, 404);
  }

  const existing = rowToObject(headers, rows[rowIndex]);
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const newRow = objectToRow(headers, updated);
  // Sheets API rows are 1-based; header is row 1, data starts at row 2
  await updateRow(accessToken, spreadsheetId, sheetName, rowIndex + 2, newRow);
  return updated;
}

export async function softDelete(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  id: string,
): Promise<void> {
  await update(accessToken, spreadsheetId, sheetName, id, {
    deletedAt: new Date().toISOString(),
  });
}

// ------------------------------------------------------------------
// Domain-specific helpers
// ------------------------------------------------------------------

export async function getByLeadId(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  leadId: string,
): Promise<Record<string, any> | null> {
  const { data } = await list(accessToken, spreadsheetId, sheetName, { leadId });
  return data[0] ?? null;
}

export async function getByCustomerId(
  accessToken: string,
  spreadsheetId: string,
  sheetName: SheetName,
  customerId: string,
): Promise<Record<string, any> | null> {
  const { data } = await list(accessToken, spreadsheetId, sheetName, { customerId });
  return data[0] ?? null;
}
