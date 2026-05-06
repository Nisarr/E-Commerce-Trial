import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../backend/server/db/schema";

export type Bindings = {
  DB: D1Database;
  ADMIN_API_KEY: string;
  JWT_SECRET: string;
  GOOGLE_SCRIPT_URL: string;
  GMAIL_SENDER_EMAIL: string;
  ADMIN_NOTIFICATION_EMAIL: string;
  EMAIL_WEBHOOK_SECRET: string;
  NODE_ENV?: string;
};

export type Variables = {
  db: DrizzleD1Database<typeof schema>;
};
