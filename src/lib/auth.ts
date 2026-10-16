import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI, username } from "better-auth/plugins";

import { db } from "./db";
import {
  email,
  EMAIL_FROM,
  RESEND_PASSWORD_RESET_TEMPLATE_ID,
  RESEND_VERIFICATION_TEMPLATE_ID,
} from "./email";

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
    crossSubDomainCookies: {
      domain: BASE_DOMAIN,
      enabled: true,
    },
    defaultCookieAttributes: {
      domain: BASE_DOMAIN,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  appName: "Bisara",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  database: prismaAdapter(db, { provider: "postgresql" }),
  disabledPaths: [
    "/delete-user",
    "/delete-user/callback",
    "/link-social",
    "/unlink-account",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // eslint-disable-next-line @typescript-eslint/require-await
    sendResetPassword: async ({ url, user }) => {
      void email.emails.send({
        from: EMAIL_FROM,
        subject: "Reset Password Anda",
        template: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: RESEND_PASSWORD_RESET_TEMPLATE_ID!,
          variables: {
            company_address: "Team 19, PAB Infinite",
            company_name: "Bisara",
            link_expiry: "24 jam",
            name: user.name,
            reset_url: url,
          },
        },
        to: user.email,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    // eslint-disable-next-line @typescript-eslint/require-await
    sendVerificationEmail: async ({ url, user }) => {
      void email.emails.send({
        from: EMAIL_FROM,
        subject: "Verifikasi Email Anda",
        template: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: RESEND_VERIFICATION_TEMPLATE_ID!,
          variables: {
            company_address: "Team 19, PAB Infinite",
            company_name: "Bisara",
            link_expiry: "24 jam",
            name: user.name,
            verification_url: url,
          },
        },
        to: user.email,
      });
    },
  },
  plugins: [
    username(),
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
