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
      console.log("[authGuard] No session found. Cookies:", req.headers.cookie);
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session;

    // Extract Google access token for Sheets API calls.
    // Priority 1: Frontend passes it via X-Google-Access-Token header
    const headerToken = req.headers["x-google-access-token"] as string | undefined;
    if (headerToken) {
      console.log("[authGuard] Using token from X-Google-Access-Token header");
      req.googleAccessToken = headerToken;
      return next();
    }

    // Priority 2: Try Better Auth's server-side getAccessToken (may not work in stateless mode)
    try {
      console.log("[authGuard] Trying server-side getAccessToken for user:", session.user.email);
      const tokenResult = await auth.api.getAccessToken({
        body: { providerId: "google" },
        headers,
      });
      console.log("[authGuard] getAccessToken result:", tokenResult ? "success" : "null");
      if (tokenResult?.accessToken) {
        req.googleAccessToken = tokenResult.accessToken;
        console.log("[authGuard] Got token server-side, length:", tokenResult.accessToken.length);
        return next();
      }
    } catch (e: any) {
      console.log("[authGuard] Could not get Google access token from Better Auth:", e.message || e);
    }

    console.log("[authGuard] No Google access token available for user:", session.user.email);
    next();
  } catch (error) {
    console.log("[authGuard] Error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
