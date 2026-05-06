import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./backend/server/db/schema";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "./.dev.vars" });

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function check() {
  if (!url || !authToken) {
    console.error("Missing Turso credentials");
    return;
  }
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  try {
    const banners = await db.select().from(schema.banners);
    console.log(`Found ${banners.length} banners in Turso.`);
    banners.forEach(b => console.log(`- ${b.id}: ${b.position} (${b.isActive ? 'active' : 'inactive'})` ));

    console.log("Clearing home_bulk cache...");
    const { eq } = await import("drizzle-orm");
    await db.delete(schema.systemCache).where(eq(schema.systemCache.key, "home_bulk"));
    console.log("Cache cleared!");

  } catch (err) {
    console.error("Error checking banners:", err);
  } finally {
    client.close();
  }
}

check();
