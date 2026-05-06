import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .dev.vars
dotenv.config({ path: path.resolve(process.cwd(), "../.dev.vars") });

export default defineConfig({
  schema: "./server/db/schemas/index.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
