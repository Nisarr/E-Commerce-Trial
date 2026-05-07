import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import fs from "fs";

// Read from .dev.vars manually since it's not a standard .env
const devVars = fs.readFileSync('./.dev.vars', 'utf-8');
const tursoUrlMatch = devVars.match(/TURSO_URL="([^"]+)"/);
const tursoTokenMatch = devVars.match(/TURSO_AUTH_TOKEN="([^"]+)"/);

const url = tursoUrlMatch ? tursoUrlMatch[1] : null;
const authToken = tursoTokenMatch ? tursoTokenMatch[1] : null;

if (!url || !authToken) {
  console.error("Could not find Turso config in .dev.vars");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function check() {
  console.log("Checking Turso DB...");
  
  const orders = await client.execute("SELECT id, invoice_id, user_id, customer_name FROM orders ORDER BY created_at DESC LIMIT 5");
  console.log("\n--- RECENT ORDERS ---");
  console.table(orders.rows);

  const users = await client.execute("SELECT id, username, email FROM users LIMIT 10");
  console.log("\n--- USERS ---");
  console.table(users.rows);
}

check().catch(console.error).finally(() => client.close());
