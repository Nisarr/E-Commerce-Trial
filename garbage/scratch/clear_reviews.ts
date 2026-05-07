
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL or TURSO_AUTH_TOKEN not found in .dev.vars");
  process.exit(1);
}

async function clearReviews() {
  const client = createClient({ url: url!, authToken: authToken! });
  try {
    console.log("Deleting all data from 'reviews' table...");
    const result = await client.execute("DELETE FROM reviews");
    console.log("Success! Rows affected:", result.rowsAffected);
  } catch (error) {
    console.error("Error clearing reviews table:", error);
  } finally {
    client.close();
  }
}

clearReviews();
