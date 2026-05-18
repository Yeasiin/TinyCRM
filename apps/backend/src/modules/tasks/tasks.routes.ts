import { Router } from "express";
import * as controller from "./tasks.controller";
import { asyncHandler } from "@/lib/async-handler";
import { validateBody } from "@/middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
} from "./tasks.schema";

export const tasksRouter = Router();

tasksRouter.get("/", asyncHandler(controller.list));
tasksRouter.get("/:id", asyncHandler(controller.getById));
tasksRouter.post(
  "/",
  validateBody(createTaskSchema),
  asyncHandler(controller.create),
);
tasksRouter.patch(
  "/:id",
  validateBody(updateTaskSchema),
  asyncHandler(controller.update),
);
tasksRouter.delete("/:id", asyncHandler(controller.remove));
