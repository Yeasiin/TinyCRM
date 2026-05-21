import { Request, Response } from "express";
import * as tasksService from "./tasks.service";

export async function list(req: Request, res: Response) {
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const filters = {
    status: req.query.status as string | undefined,
    leadId: req.query.leadId as string | undefined,
    customerId: req.query.customerId as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
  };

  const result = await tasksService.listTasks(
    accessToken,
    spreadsheetId,
    filters,
  );
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const task = await tasksService.getTask(
    accessToken,
    spreadsheetId,
    req.params.id,
  );
  res.json(task);
}

export async function create(req: Request, res: Response) {
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const task = await tasksService.createTask(
    accessToken,
    spreadsheetId,
    req.body,
  );
  res.status(201).json(task);
}

export async function update(req: Request, res: Response) {
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const task = await tasksService.updateTask(
    accessToken,
    spreadsheetId,
    req.params.id,
    req.body,
  );
  res.json(task);
}

export async function remove(req: Request, res: Response) {
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  await tasksService.deleteTask(
    accessToken,
    spreadsheetId,
    req.params.id,
  );
  res.status(204).send();
}
