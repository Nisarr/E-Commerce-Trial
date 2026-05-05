import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:./backend/dev.db",
});

async function checkTable() {
  try {
    const result = await client.execute("PRAGMA table_info(product_sales);");
    console.log("product_sales table info:");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error checking table:", error);
  }
}

checkTable();
