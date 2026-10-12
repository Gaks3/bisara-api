import { toNodeHandler } from "better-auth/node";
import { createConfig } from "express-zod-api";

import { auth } from "./lib/auth";

const PORT = process.env.PORT ?? 4000;
const LOGGER_LEVEL =
  (process.env.LOGGER_LEVEL ?? process.env.NODE_ENV === "production")
    ? "info"
    : "debug";

const config = createConfig({
  beforeRouting: ({ app }) => {
    app.all("/api/auth/*splat", toNodeHandler(auth));
  },
  cookies: true,
  cors: true,
  http: { listen: PORT },
  logger: {
    color: true,
    depth: 2,
    level: LOGGER_LEVEL,
  },
});

export default config;
