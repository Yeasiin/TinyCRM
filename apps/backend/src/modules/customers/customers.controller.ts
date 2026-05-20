import { Request, Response } from "express";
import * as customersService from "./customers.service";

export async function list(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const filters = {
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
  };

  const result = await customersService.listCustomers(
    accessToken,
    spreadsheetId,
    userId,
    filters,
  );
  res.json(result);
}

export async function getById(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const customer = await customersService.getCustomer(
    accessToken,
    spreadsheetId,
    userId,
    req.params.id,
  );
  res.json(customer);
}

export async function create(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const customer = await customersService.createCustomer(
    accessToken,
    spreadsheetId,
    userId,
    req.body,
  );
  res.status(201).json(customer);
}

export async function convert(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const { leadId, ...extra } = req.body;
  const customer = await customersService.convertLeadToCustomer(
    accessToken,
    spreadsheetId,
    userId,
    leadId,
    extra,
  );
  res.status(201).json(customer);
}

export async function update(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  const customer = await customersService.updateCustomer(
    accessToken,
    spreadsheetId,
    userId,
    req.params.id,
    req.body,
  );
  res.json(customer);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user!.id;
  const accessToken = req.googleAccessToken!;
  const spreadsheetId = req.spreadsheetId!;
  await customersService.deleteCustomer(
    accessToken,
    spreadsheetId,
    userId,
    req.params.id,
  );
  res.status(204).send();
}
