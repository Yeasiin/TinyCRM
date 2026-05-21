import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function stats(req: Request, res: Response) {
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const data = await dashboardService.getDashboardStats(
    accessToken,
    spreadsheetId,
  );
  res.json(data);
}
