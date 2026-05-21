import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { authGuard } from "./middleware/auth-guard";
import { apiRouter } from "./routes";
import { errorHandler } from "./lib/error-handler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Spreadsheet-Id", "X-Google-Access-Token"],
  }),
);

// Better Auth routes (must be before express.json)
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint to check auth state
app.get("/api/debug/auth", async (req, res) => {
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
    let tokenResult = null;
    let tokenError = null;

    if (session) {
      try {
        tokenResult = await auth.api.getAccessToken({
          body: { providerId: "google" },
          headers,
        });
      } catch (e: any) {
        tokenError = e.message || String(e);
      }
    }

    res.json({
      hasSession: !!session,
      user: session?.user || null,
      cookies: req.headers.cookie || null,
      hasGoogleToken: !!tokenResult?.accessToken,
      tokenError,
      tokenScopes: tokenResult?.scopes || null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// CRM API routes (protected)
app.use("/api/crm", authGuard, apiRouter);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
