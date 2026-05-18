import { Request, Response } from "express";
import * as attachmentsService from "./attachments.service";

export async function list(req: Request, res: Response) {
  const userId = req.user!.id;
  const filters = {
    leadId: req.query.leadId as string | undefined,
    customerId: req.query.customerId as string | undefined,
    taskId: req.query.taskId as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined,
  };

  const result = await attachmentsService.listAttachments(userId, filters);
  res.json(result);
}

export async function presign(req: Request, res: Response) {
  const userId = req.user!.id;
  const { filename, contentType, leadId, customerId, taskId } = req.body;

  const result = await attachmentsService.createPresignedUploadUrl(userId, {
    filename,
    contentType,
    leadId,
    customerId,
    taskId,
  });

  res.json(result);
}

export async function confirm(req: Request, res: Response) {
  const userId = req.user!.id;
  const { size } = req.body;
  const attachment = await attachmentsService.confirmAttachmentUpload(
    userId,
    req.params.id,
    size,
  );
  res.json(attachment);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user!.id;
  await attachmentsService.deleteAttachment(userId, req.params.id);
  res.status(204).send();
}
