import { Middleware } from "express-zod-api";
import createHttpError from "http-errors";

import { auth } from "@/lib/auth";

export const authMiddleware = new Middleware({
  handler: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) throw createHttpError(401, "Unauthorized");

    return {
      session: session.session,
      user: session.user,
    };
  },
  security: {
    and: [
      {
        name: "auth",
        type: "cookie",
      },
    ],
  },
});
