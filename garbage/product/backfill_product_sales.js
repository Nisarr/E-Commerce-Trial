import { createClient } from '@libsql/client';
import crypto from 'crypto';

const TURSO_URL = process.env.TURSO_URL || "file:backend/dev.db";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function backfillProductSales() {
  console.log("🚀 Starting Product Sales Backfill...");
  
  try {
    // 1. Clear existing product_sales to avoid duplicates if re-run
    await db.execute("DELETE FROM product_sales");
    console.log("Cleared existing product_sales table.");

    // 2. Fetch all order items with order details
    const res = await db.execute(`
      SELECT 
        oi.product_id,
        oi.order_id,
        oi.quantity,
        oi.price,
        o.user_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.invoice_id,
        o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
    `);

    const items = res.rows;
    console.log(`Found ${items.length} order items to backfill.`);

    for (const item of items) {
      const id = crypto.randomUUID();
      await db.execute({
        sql: `
          INSERT INTO product_sales (
            id, product_id, order_id, user_id, customer_name, customer_email, 
            customer_phone, invoice_id, price, quantity, total, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          item.product_id,
          item.order_id,
          item.user_id || null,
          item.customer_name,
          item.customer_email || null,
          item.customer_phone || "N/A",
          item.invoice_id,
          item.price,
          item.quantity,
          item.price * item.quantity,
          item.created_at
        ]
      });
    }
    
    console.log(`\n✨ Backfill complete! Inserted ${items.length} records.`);
  } catch (error) {
    console.error("❌ Backfill failed:", error);
  } finally {
    process.exit(0);
  }
}

backfillProductSales();
