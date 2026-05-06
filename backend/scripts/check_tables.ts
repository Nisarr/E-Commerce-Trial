
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

async function debug() {
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log("Tables in DB:", tables.rows.map(r => r.name));

  const columns = await client.execute("PRAGMA table_info(system_cache);");
  console.log("Columns in system_cache:", columns.rows.map(r => ({ name: r.name, type: r.type })));
}

debug();
