import { Request, Response } from "express";
import * as dealsService from "./deals.service";

export async function list(req: Request, res: Response) {
  const userId = req.user!.id;
  const filters = {
    stage: req.query.stage as string | undefined,
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
  };

  const result = await dealsService.listDeals(userId, filters);
  res.json(result);
}

export async function pipeline(req: Request, res: Response) {
  const userId = req.user!.id;
  const result = await dealsService.getPipeline(userId);
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const userId = req.user!.id;
  const deal = await dealsService.getDeal(userId, req.params.id);
  res.json(deal);
}

export async function create(req: Request, res: Response) {
  const userId = req.user!.id;
  const deal = await dealsService.createDeal(userId, req.body);
  res.status(201).json(deal);
}

export async function updateStage(req: Request, res: Response) {
  const userId = req.user!.id;
  const deal = await dealsService.updateDealStage(userId, req.params.id, req.body);
  res.json(deal);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user!.id;
  await dealsService.deleteDeal(userId, req.params.id);
  res.status(204).send();
}
