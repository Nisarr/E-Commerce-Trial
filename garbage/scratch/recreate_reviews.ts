
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL or TURSO_AUTH_TOKEN not found in .dev.vars");
  process.exit(1);
}

async function recreateReviews() {
  const client = createClient({ url: url!, authToken: authToken! });
  try {
    console.log("Dropping 'reviews' table...");
    await client.execute("DROP TABLE IF EXISTS reviews");
    
    console.log("Creating 'reviews' table with correct schema...");
    await client.execute(`
      CREATE TABLE reviews (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        rating INTEGER NOT NULL,
        title TEXT,
        content TEXT,
        images TEXT,
        is_verified INTEGER DEFAULT 0,
        order_id TEXT,
        helpful_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'approved',
        created_at INTEGER
      )
    `);
    console.log("Success! Table recreated with 'order_id' column.");
  } catch (error: any) {
    console.error("Failed! Error:", error.message);
  } finally {
    client.close();
  }
}

recreateReviews();
