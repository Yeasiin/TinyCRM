import { google, sheets_v4 } from "googleapis";

const DEFAULT_SPREADSHEET_TITLE = "Tinycrm Data";

function getSheetsClient(accessToken: string): sheets_v4.Sheets {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth });
}

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

export async function findSpreadsheet(accessToken: string): Promise<string | null> {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${DEFAULT_SPREADSHEET_TITLE}' and trashed=false`,
    spaces: "drive",
    fields: "files(id, name)",
  });
  const files = res.data.files ?? [];
  if (files.length > 0) {
    return files[0].id!;
  }
  return null;
}

export async function findSpreadsheetById(accessToken: string, id: string): Promise<{ id: string; name: string } | null> {
  const drive = getDriveClient(accessToken);
  try {
    const res = await drive.files.get({
      fileId: id,
      fields: "id, name",
    });
    if (res.data) {
      return { id: res.data.id!, name: res.data.name! };
    }
  } catch (e: any) {
    console.error("[findSpreadsheetById] Error:", e.message || e);
    return null;
  }
  return null;
}

export async function listSpreadsheets(accessToken: string): Promise<{ id: string; name: string; createdTime?: string | null }[]> {
  try {
    const drive = getDriveClient(accessToken);
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      spaces: "drive",
      fields: "files(id, name, createdTime)",
      orderBy: "name",
    });
    return (res.data.files ?? []).map((f) => ({
      id: f.id!,
      name: f.name!,
      createdTime: f.createdTime,
    }));
  } catch (e: any) {
    console.error("[listSpreadsheets] Google Drive API error:", e.message || e);
    if (e.response?.data) {
      console.error("[listSpreadsheets] Google error details:", JSON.stringify(e.response.data));
    }
    throw e;
  }
}

export async function createSpreadsheet(
  accessToken: string,
  sheetNames: string[],
  title?: string,
): Promise<string> {
  const sheets = getSheetsClient(accessToken);

  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: title || DEFAULT_SPREADSHEET_TITLE },
      sheets: sheetNames.map((name) => ({
        properties: { title: name },
      })),
    },
  });

  const spreadsheetId = createRes.data.spreadsheetId!;
  return spreadsheetId;
}

export async function getSheetData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
): Promise<string[][]> {
  const sheets = getSheetsClient(accessToken);
  const range = `'${sheetName}'`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return res.data.values ?? [];
}

export async function appendRows(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: string[][],
): Promise<void> {
  const sheets = getSheetsClient(accessToken);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });
}

export async function updateRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  values: string[],
): Promise<void> {
  const sheets = getSheetsClient(accessToken);
  const range = `'${sheetName}'!A${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function clearRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
): Promise<void> {
  const sheets = getSheetsClient(accessToken);
  const range = `'${sheetName}'!A${rowIndex}:${rowIndex}`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
}

export { getSheetsClient, DEFAULT_SPREADSHEET_TITLE };
