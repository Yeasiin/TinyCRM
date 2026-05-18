import { Router } from "express";
import * as controller from "./customers.controller";
import { asyncHandler } from "@/lib/async-handler";
import { validateBody } from "@/middleware/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customers.schema";

export const customersRouter = Router();

customersRouter.get("/", asyncHandler(controller.list));
customersRouter.get("/:id", asyncHandler(controller.getById));
customersRouter.post(
  "/",
  validateBody(createCustomerSchema),
  asyncHandler(controller.create),
);
customersRouter.post(
  "/convert",
  asyncHandler(controller.convert),
);
customersRouter.patch(
  "/:id",
  validateBody(updateCustomerSchema),
  asyncHandler(controller.update),
);
customersRouter.delete("/:id", asyncHandler(controller.remove));
