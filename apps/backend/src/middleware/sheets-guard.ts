import { Request, Response, NextFunction } from "express";
import { AppError } from "@/lib/error-handler";

export async function sheetsGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.googleAccessToken;
    if (!token) {
      console.error("[sheetsGuard] Missing googleAccessToken for user:", req.user?.email);
      throw new AppError(
        "Google account access required. Please sign in with Google and grant spreadsheet access.",
        401,
      );
    }

    const spreadsheetId = req.headers["x-spreadsheet-id"] as string | undefined;
    if (!spreadsheetId) {
      throw new AppError(
        "SPREADSHEET_NOT_SELECTED",
        400,
      );
    }

    req.spreadsheetId = spreadsheetId;
    next();
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : "Failed to access spreadsheet";
    return res.status(statusCode).json({ error: message });
  }
}
