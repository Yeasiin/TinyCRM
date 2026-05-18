import { Request, Response } from "express";
import * as leadsService from "./leads.service";

export async function list(req: Request, res: Response) {
  const userId = req.user!.id;
  const filters = {
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
    assignedTo: req.query.assignedTo as string | undefined,
  };

  const result = await leadsService.listLeads(userId, filters);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const userId = req.user!.id;
  const lead = await leadsService.getLead(userId, req.params.id);
  res.json(lead);
}

export async function create(req: Request, res: Response) {
  const userId = req.user!.id;
  const lead = await leadsService.createLead(userId, req.body);
  res.status(201).json(lead);
}

export async function update(req: Request, res: Response) {
  const userId = req.user!.id;
  const lead = await leadsService.updateLead(userId, req.params.id, req.body);
  res.json(lead);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user!.id;
  await leadsService.deleteLead(userId, req.params.id);
  res.status(204).send();
}
