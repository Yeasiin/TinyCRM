import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "@/lib/error-handler";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      throw new AppError(message, 400, "VALIDATION_ERROR");
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      throw new AppError(message, 400, "VALIDATION_ERROR");
    }
    Object.assign(req.query, result.data);
    next();
  };
}
