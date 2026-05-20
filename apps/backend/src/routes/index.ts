import { Router } from "express";
import { sheetsGuard } from "@/middleware/sheets-guard";
import { leadsRouter } from "@/modules/leads/leads.routes";
import { dealsRouter } from "@/modules/deals/deals.routes";
import { customersRouter } from "@/modules/customers/customers.routes";
import { tasksRouter } from "@/modules/tasks/tasks.routes";
import { dashboardRouter } from "@/modules/dashboard/dashboard.routes";
import { notesRouter } from "@/modules/notes/notes.routes";
import { activitiesRouter } from "@/modules/activities/activities.routes";
import { sheetsRouter } from "@/modules/sheets/sheets.routes";

export const apiRouter = Router();

// Sheet management routes (do not require a selected sheet)
apiRouter.use("/sheets", sheetsRouter);

// All other CRM routes need the user's Google spreadsheet selected
apiRouter.use(sheetsGuard);

apiRouter.use("/leads", leadsRouter);
apiRouter.use("/deals", dealsRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/notes", notesRouter);
apiRouter.use("/activities", activitiesRouter);
