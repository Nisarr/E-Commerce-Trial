
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL or TURSO_AUTH_TOKEN not found in .dev.vars");
  process.exit(1);
}

async function listTables() {
  const client = createClient({ url: url!, authToken: authToken! });
  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("All tables:");
    console.table(result.rows);
  } catch (error) {
    console.error("Error listing tables:", error);
  } finally {
    client.close();
  }
}

listTables();
