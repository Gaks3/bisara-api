import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const RESEND_VERIFICATION_TEMPLATE_ID =
  process.env.RESEND_VERIFICATION_TEMPLATE_ID;
export const RESEND_PASSWORD_RESET_TEMPLATE_ID =
  process.env.RESEND_PASSWORD_RESET_TEMPLATE_ID;
if (
  !process.env.RESEND_API_KEY ||
  !process.env.EMAIL_FROM ||
  !process.env.RESEND_VERIFICATION_TEMPLATE_ID ||
  !process.env.RESEND_PASSWORD_RESET_TEMPLATE_ID
) {
  throw new Error(
    "RESEND_API_KEY or EMAIL_FROM or RESEND_VERIFICATION_TEMPLATE_ID or RESEND_PASSWORD_RESET_TEMPLATE_ID is not set in environment variables.",
  );
}

export const email = new Resend(RESEND_API_KEY);
