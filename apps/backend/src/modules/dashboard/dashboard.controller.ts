import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function stats(req: Request, res: Response) {
  const userId = req.user!.id;
  const data = await dashboardService.getDashboardStats(userId);
  res.json(data);
}
