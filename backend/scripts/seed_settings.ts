
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../server/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load environment variables from root .env
dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_URL || "file:dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  console.log("Seeding system settings...");

  const defaultSettings = [
    { key: "bkash_number", value: "01700000000" },
    { key: "nagad_number", value: "01800000000" },
    { key: "admin_email", value: "admin@playpenhouse.com" },
    { key: "shipping_charge_inside_dhaka", value: "60" },
    { key: "shipping_charge_outside_dhaka", value: "120" },
  ];

  for (const setting of defaultSettings) {
    const [existing] = await db.select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, setting.key));

    if (!existing) {
      console.log(`Inserting: ${setting.key}`);
      await db.insert(schema.systemSettings).values({
        id: crypto.randomUUID(),
        key: setting.key,
        value: setting.value,
        updatedAt: new Date().toISOString()
      });
    } else {
      console.log(`Skipping: ${setting.key} (already exists)`);
    }
  }

  console.log("System settings seeded successfully!");
  process.exit(0);
}

main().catch(console.error);
