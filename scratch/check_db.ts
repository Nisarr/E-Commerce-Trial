
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../backend/server/db/schema';
import path from 'path';

async function main() {
  const dbPath = path.join(process.cwd(), 'backend', 'server', 'db', 'local.db');
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  console.log("--- ORDERS ---");
  const allOrders = await db.select().from(schema.orders);
  console.log(JSON.stringify(allOrders, null, 2));

  console.log("--- USERS ---");
  const allUsers = await db.select().from(schema.users);
  console.log(JSON.stringify(allUsers, null, 2));
}

main().catch(console.error);
