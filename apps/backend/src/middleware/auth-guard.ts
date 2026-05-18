import { Request, Response, NextFunction } from "express";
import { auth } from "@/auth";

export async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const session = await auth.api.getSession({ headers });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
