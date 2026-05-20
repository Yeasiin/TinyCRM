import {
  findSpreadsheet,
  createSpreadsheet as createSheet,
  appendRows,
} from "./google-sheets";

export const SHEET_NAMES = [
  "Leads",
  "Customers",
  "Deals",
  "Tasks",
  "Notes",
  "Activities",
] as const;

export type SheetName = (typeof SHEET_NAMES)[number];

export const HEADERS: Record<SheetName, string[]> = {
  Leads: [
    "id",
    "userId",
    "name",
    "email",
    "phone",
    "company",
    "status",
    "source",
    "estimatedValue",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ],
  Customers: [
    "id",
    "userId",
    "leadId",
    "name",
    "email",
    "phone",
    "company",
    "address",
    "industry",
    "notes",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ],
  Deals: [
    "id",
    "userId",
    "leadId",
    "customerId",
    "title",
    "stage",
    "value",
    "closedAt",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ],
  Tasks: [
    "id",
    "userId",
    "leadId",
    "customerId",
    "title",
    "description",
    "dueDate",
    "status",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ],
  Notes: [
    "id",
    "userId",
    "leadId",
    "customerId",
    "content",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ],
  Activities: [
    "id",
    "userId",
    "leadId",
    "customerId",
    "dealId",
    "taskId",
    "type",
    "description",
    "metadata",
    "createdAt",
  ],
};

export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  const existingId = await findSpreadsheet(accessToken);
  if (existingId) {
    return existingId;
  }

  const newId = await createSheet(accessToken, [...SHEET_NAMES]);
  // Write header rows to each sheet
  await Promise.all(
    SHEET_NAMES.map((name) =>
      appendRows(accessToken, newId, name, [HEADERS[name]]),
    ),
  );
  return newId;
}

export async function createCrmSpreadsheet(
  accessToken: string,
  title?: string,
): Promise<string> {
  const newId = await createSheet(accessToken, [...SHEET_NAMES], title);
  await Promise.all(
    SHEET_NAMES.map((name) =>
      appendRows(accessToken, newId, name, [HEADERS[name]]),
    ),
  );
  return newId;
}
