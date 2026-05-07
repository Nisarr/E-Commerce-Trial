import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../backend/server/db/schema";

export type Bindings = {
  DB: D1Database;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
  ADMIN_API_KEY: string;
  JWT_SECRET: string;
  GOOGLE_SCRIPT_URL: string;
  GMAIL_SENDER_EMAIL: string;
  ADMIN_NOTIFICATION_EMAIL: string;
  EMAIL_WEBHOOK_SECRET: string;
  NODE_ENV?: string;
  LICENSE_KEY?: string;
};

export type Variables = {
  db: LibSQLDatabase<typeof schema>;
};
