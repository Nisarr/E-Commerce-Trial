import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkOrders() {
  const db = await open({
    filename: './dev.db',
    driver: sqlite3.Database
  });

  console.log("--- ORDERS ---");
  const orders = await db.all('SELECT id, invoice_id, user_id, customer_name, total_amount FROM orders ORDER BY created_at DESC LIMIT 5');
  console.table(orders);

  console.log("\n--- USERS ---");
  const users = await db.all('SELECT id, username, email FROM users LIMIT 5');
  console.table(users);

  await db.close();
}

checkOrders().catch(console.error);
