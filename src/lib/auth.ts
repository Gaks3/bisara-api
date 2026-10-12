import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { db } from "./db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Google OAuth credentials are not set in environment variables.",
  );
}

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not set in environment variables.");
}

const BASE_DOMAIN = process.env.BASE_DOMAIN;
if (!BASE_DOMAIN) {
  throw new Error("BASE_DOMAIN is not set in environment variables.");
}

export const auth = betterAuth({
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  advanced: {
    cookiePrefix: "auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  appName: "Goldy Outfit",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  database: prismaAdapter(db, { provider: "postgresql" }),
  disabledPaths: [
    "/sign-in/email",
    "/sign-up/email",
    "/forget-password",
    "/reset-password",
    "/reset-password/:token",
    "/request-password-reset",
    "/verify-email",
    "/send-verification-email",
    "/change-email",
    "/change-password",
    "/delete-user",
    "/delete-user/callback",
    "/link-social",
    "/unlink-account",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  onAPIError: {
    errorURL: `${FRONTEND_URL}/auth/error`,
  },
  plugins: [
    openAPI({
      disableDefaultReference: true,
    }),
  ],
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
  },
  trustedOrigins: [FRONTEND_URL],
});

export type AuthType = typeof auth;
