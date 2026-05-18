import { Router } from "express";
import * as controller from "./attachments.controller";
import { asyncHandler } from "@/lib/async-handler";

export const attachmentsRouter = Router();

attachmentsRouter.get("/", asyncHandler(controller.list));
attachmentsRouter.post("/presign", asyncHandler(controller.presign));
attachmentsRouter.post("/:id/confirm", asyncHandler(controller.confirm));
attachmentsRouter.delete("/:id", asyncHandler(controller.remove));
