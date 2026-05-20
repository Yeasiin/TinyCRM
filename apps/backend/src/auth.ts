import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    },
  },
  account: {
    storeAccountCookie: true,
  },
  trustedOrigins: ["http://localhost:3000"],
});
