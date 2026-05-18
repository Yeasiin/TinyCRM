import { Router } from "express";
import * as controller from "./dashboard.controller";
import { asyncHandler } from "@/lib/async-handler";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", asyncHandler(controller.stats));
