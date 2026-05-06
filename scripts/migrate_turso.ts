
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL or TURSO_AUTH_TOKEN not found in .dev.vars");
  process.exit(1);
}

async function runMigration() {
  console.log("Running migrations to Turso...");
  const client = createClient({ url: url!, authToken: authToken! });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: "./backend/drizzle" });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.close();
  }
}

runMigration();
