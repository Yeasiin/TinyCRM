import { Request, Response } from "express";
import * as notesService from "./notes.service";

export async function list(req: Request, res: Response) {
  const userId = req.user!.id;
  const filters = {
    leadId: req.query.leadId as string | undefined,
    customerId: req.query.customerId as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
  };

  const result = await notesService.listNotes(userId, filters);
  res.json(result);
}

export async function create(req: Request, res: Response) {
  const userId = req.user!.id;
  const note = await notesService.createNote(userId, req.body);
  res.status(201).json(note);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user!.id;
  await notesService.deleteNote(userId, req.params.id);
  res.status(204).send();
}
