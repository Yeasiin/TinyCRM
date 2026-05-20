import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function stats(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const data = await dashboardService.getDashboardStats(
    accessToken,
    spreadsheetId,
    userId,
  );
  res.json(data);
}
