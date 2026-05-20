import { Router } from "express";
import { authGuard } from "@/middleware/auth-guard";
import { asyncHandler } from "@/lib/async-handler";
import * as controller from "./sheets.controller";

export const sheetsRouter = Router();

sheetsRouter.get("/", authGuard, asyncHandler(controller.listSheets));
sheetsRouter.post("/select", authGuard, asyncHandler(controller.selectSheet));
sheetsRouter.post("/create", authGuard, asyncHandler(controller.createSheet));
