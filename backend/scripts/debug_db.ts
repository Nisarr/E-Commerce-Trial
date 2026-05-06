
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../server/db/schema";
import { count } from "drizzle-orm";

async function main() {
  const client = createClient({
    url: "file:dev.db",
  });
  const db = drizzle(client, { schema });

  const [res] = await db.select({ value: count() }).from(schema.products);
  console.log(`Total products: ${res.value}`);
  
  const all = await db.query.products.findMany({ limit: 10 });
  console.log("Sample products:", all.map(p => p.title));
  
  process.exit(0);
}

main().catch(console.error);
