import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schemas/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/baby_pen_house_db.sqlite", // Path to local D1 (approximate, usually better to use a temp file for generation)
  },
});
