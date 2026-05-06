import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL || "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkOrders() {
  const rs = await client.execute('SELECT * FROM orders');
  console.log('Orders:', rs.rows);
  const users = await client.execute('SELECT * FROM users');
  console.log('Users:', users.rows);
}

checkOrders();
