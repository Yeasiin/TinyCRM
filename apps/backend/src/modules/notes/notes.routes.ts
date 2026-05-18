import { Router } from "express";
import * as controller from "./notes.controller";
import { asyncHandler } from "@/lib/async-handler";
import { validateBody } from "@/middleware/validate";
import { createNoteSchema } from "./notes.schema";

export const notesRouter = Router();

notesRouter.get("/", asyncHandler(controller.list));
notesRouter.post(
  "/",
  validateBody(createNoteSchema),
  asyncHandler(controller.create),
);
notesRouter.delete("/:id", asyncHandler(controller.remove));
