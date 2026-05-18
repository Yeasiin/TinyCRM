import { Router } from "express";
import * as controller from "./activities.controller";
import { asyncHandler } from "@/lib/async-handler";

export const activitiesRouter = Router();

activitiesRouter.get("/", asyncHandler(controller.list));
