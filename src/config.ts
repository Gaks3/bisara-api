import { apiReference } from "@scalar/express-api-reference";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { createConfig } from "express-zod-api";
import { Documentation } from "express-zod-api/documentation";

import { auth } from "./lib/auth";
import routing from "./routing";

const PORT = process.env.PORT ?? "4000";
const LOGGER_LEVEL =
  (process.env.LOGGER_LEVEL ?? process.env.NODE_ENV === "production")
    ? "info"
    : "debug";

const config = createConfig({
  beforeRouting: ({ app }) => {
    app.all("/api/auth/*splat", toNodeHandler(auth));

    if (process.env.NODE_ENV !== "production") {
      const documentation = new Documentation({
        config,
        info: {
          description: "API platform pembelajaran BISINDO interaktif BISARA.",
          title: "BISARA API",
          version: "1.0.0",
        },
        routing,
        server: process.env.API_URL ?? `http://localhost:${PORT}`,
      });

      let authSchemaLoaded = false;
      const loadAuthSchema = async () => {
        if (authSchemaLoaded) return;

        const authSchema =
          (await auth.api.generateOpenAPISchema()) as unknown as typeof documentation.rootDoc;
        const authPaths = Object.fromEntries(
          Object.entries(authSchema.paths ?? {}).map(([path, definition]) => [
            `/api/auth${path.startsWith("/") ? path : `/${path}`}`,
            definition,
          ]),
        );
        documentation.rootDoc.paths = {
          ...documentation.rootDoc.paths,
          ...authPaths,
        };
        documentation.rootDoc.components = {
          ...documentation.rootDoc.components,
          ...authSchema.components,
          schemas: {
            ...documentation.rootDoc.components?.schemas,
            ...authSchema.components?.schemas,
          },
          securitySchemes: {
            ...documentation.rootDoc.components?.securitySchemes,
            ...authSchema.components?.securitySchemes,
          },
        };
        documentation.rootDoc.tags = [
          ...(documentation.rootDoc.tags ?? []),
          ...(authSchema.tags ?? []),
        ];
        authSchemaLoaded = true;
      };

      app.get("/openapi.json", async (_request, response) => {
        await loadAuthSchema();
        response.json(documentation.rootDoc);
      });

      app.get("/openapi.yaml", async (_request, response) => {
        await loadAuthSchema();
        response.type("text/yaml").send(documentation.getSpecAsYaml());
      });

      app.get(
        "/docs",
        apiReference({
          pageTitle: "BISARA API Reference",
          url: "/openapi.json",
        }),
      );
    }
  },
  cookies: true,
  cors: cors({
    credentials: true,
    origin: [
      process.env.FRONTEND_URL ?? "http://localhost:3000",
      "http://localhost:3000",
    ],
  }),
  http: { listen: PORT },
  logger: {
    color: true,
    depth: 2,
    level: LOGGER_LEVEL,
  },
});

export default config;
