import { Request, Response } from "express";
import { listSpreadsheets, findSpreadsheetById } from "@/lib/google-sheets";
import { createCrmSpreadsheet } from "@/lib/sheets-schema";
import { AppError } from "@/lib/error-handler";

export async function listSheets(req: Request, res: Response) {
  const token = req.googleAccessToken;
  if (!token) {
    throw new AppError("Google account access required", 401);
  }
  try {
    const sheets = await listSpreadsheets(token);
    res.json({ sheets });
  } catch (e: any) {
    console.error("[listSheets] Error:", e.message || e);
    if (e.response?.data) {
      console.error("[listSheets] Google API error:", JSON.stringify(e.response.data));
    }
    throw new AppError(
      e.response?.data?.error?.message || e.message || "Failed to list spreadsheets",
      e.response?.status || 500,
    );
  }
}

export async function selectSheet(req: Request, res: Response) {
  const token = req.googleAccessToken;
  if (!token) {
    throw new AppError("Google account access required", 401);
  }
  const { spreadsheetId } = req.body;
  if (!spreadsheetId || typeof spreadsheetId !== "string") {
    throw new AppError("spreadsheetId is required", 400);
  }
  const sheet = await findSpreadsheetById(token, spreadsheetId);
  if (!sheet) {
    throw new AppError("Spreadsheet not found or access denied", 404);
  }
  res.json({ success: true, sheet });
}

export async function createSheet(req: Request, res: Response) {
  const token = req.googleAccessToken;
  if (!token) {
    throw new AppError("Google account access required", 401);
  }
  try {
    const { title } = req.body;
    const id = await createCrmSpreadsheet(token, title);
    res.json({ id, name: title || "My CRM Data" });
  } catch (e: any) {
    console.error("[createSheet] Error:", e.message || e);
    if (e.response?.data) {
      console.error("[createSheet] Google API error:", JSON.stringify(e.response.data));
    }
    throw new AppError(
      e.response?.data?.error?.message || e.message || "Failed to create spreadsheet",
      e.response?.status || 500,
    );
  }
}
