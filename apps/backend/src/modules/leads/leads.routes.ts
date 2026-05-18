import { Router } from "express";
import * as controller from "./leads.controller";
import { asyncHandler } from "@/lib/async-handler";
import { validateBody, validateQuery } from "@/middleware/validate";
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsQuerySchema,
} from "./leads.schema";

export const leadsRouter = Router();

leadsRouter.get(
  "/",
  validateQuery(listLeadsQuerySchema),
  asyncHandler(controller.list),
);
leadsRouter.get("/:id", asyncHandler(controller.getById));
leadsRouter.post(
  "/",
  validateBody(createLeadSchema),
  asyncHandler(controller.create),
);
leadsRouter.patch(
  "/:id",
  validateBody(updateLeadSchema),
  asyncHandler(controller.update),
);
leadsRouter.delete("/:id", asyncHandler(controller.remove));
