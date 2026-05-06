
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_URL not found in .dev.vars");
  process.exit(1);
}

async function checkTables() {
  const client = createClient({ url: url!, authToken: authToken! });
  try {
    const reviewsInfo = await client.execute("PRAGMA table_info(reviews)");
    console.log("Reviews table info:");
    console.table(reviewsInfo.rows);

    const ordersInfo = await client.execute("PRAGMA table_info(orders)");
    console.log("Orders table info:");
    console.table(ordersInfo.rows);
  } catch (error) {
    console.error("Error checking tables:", error);
  } finally {
    client.close();
  }
}

checkTables();
