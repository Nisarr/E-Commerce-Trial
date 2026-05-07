
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL or TURSO_AUTH_TOKEN not found in .dev.vars");
  process.exit(1);
}

async function testInsert() {
  const client = createClient({ url: url!, authToken: authToken! });
  try {
    console.log("Attempting to insert a review with order_id...");
    await client.execute({
      sql: "INSERT INTO reviews (id, product_id, user_id, username, rating, order_id) VALUES (?, ?, ?, ?, ?, ?)",
      args: ["test-id", "test-prod", "test-user", "test-name", 5, "test-order"]
    });
    console.log("Success! The column exists and accepts data.");
    
    // Clean up
    await client.execute({ sql: "DELETE FROM reviews WHERE id = ?", args: ["test-id"] });
  } catch (error: any) {
    console.error("Insert failed! Error:", error.message);
  } finally {
    client.close();
  }
}

testInsert();
