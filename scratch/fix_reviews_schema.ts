
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL or TURSO_AUTH_TOKEN not found in .dev.vars");
  process.exit(1);
}

async function fixSchema() {
  const client = createClient({ url: url!, authToken: authToken! });
  try {
    console.log("Manually adding 'order_id' column to 'reviews' table...");
    await client.execute("ALTER TABLE reviews ADD COLUMN order_id TEXT");
    console.log("Success!");
  } catch (error) {
    console.error("Error adding column (maybe it already exists?):", error);
  } finally {
    client.close();
  }
}

fixSchema();
