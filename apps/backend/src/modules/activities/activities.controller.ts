import { Request, Response } from "express";
import * as activitiesService from "./activities.service";

export async function list(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const filters = {
    leadId: req.query.leadId as string | undefined,
    customerId: req.query.customerId as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
  };

  const result = await activitiesService.listActivities(
    accessToken,
    spreadsheetId,
    userId,
    filters,
  );
  res.json(result);
}
