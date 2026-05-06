import { createClient } from "@libsql/client";
import fs from "fs";

const devVars = fs.readFileSync('./.dev.vars', 'utf-8');
const tursoUrlMatch = devVars.match(/TURSO_URL="([^"]+)"/);
const tursoTokenMatch = devVars.match(/TURSO_AUTH_TOKEN="([^"]+)"/);

const url = tursoUrlMatch ? tursoUrlMatch[1] : null;
const authToken = tursoTokenMatch ? tursoTokenMatch[1] : null;

const client = createClient({ url, authToken });

async function repair() {
  const email = 'adnanshahria2026@gmail.com';
  console.log(`Repairing orders for ${email}...`);

  // 1. Find the user ID
  const userResult = await client.execute({
    sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
    args: [email]
  });

  if (userResult.rows.length === 0) {
    console.error("User not found!");
    return;
  }

  const userId = userResult.rows[0].id;
  console.log(`Found User ID: ${userId}`);

  // 2. Update orders
  const updateResult = await client.execute({
    sql: "UPDATE orders SET user_id = ? WHERE customer_email = ? AND user_id IS NULL",
    args: [userId, email]
  });

  console.log(`Updated ${updateResult.rowsAffected} orders.`);
}

repair().catch(console.error).finally(() => client.close());
