import { Router } from "express";
import * as controller from "./deals.controller";
import { asyncHandler } from "@/lib/async-handler";
import { validateBody } from "@/middleware/validate";
import {
  createDealSchema,
  updateDealStageSchema,
} from "./deals.schema";

export const dealsRouter = Router();

dealsRouter.get("/", asyncHandler(controller.list));
dealsRouter.get("/pipeline", asyncHandler(controller.pipeline));
dealsRouter.get("/:id", asyncHandler(controller.getById));
dealsRouter.post(
  "/",
  validateBody(createDealSchema),
  asyncHandler(controller.create),
);
dealsRouter.patch(
  "/:id/stage",
  validateBody(updateDealStageSchema),
  asyncHandler(controller.updateStage),
);
dealsRouter.delete("/:id", asyncHandler(controller.remove));
