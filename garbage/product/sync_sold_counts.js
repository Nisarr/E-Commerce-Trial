import { createClient } from '@libsql/client';

const TURSO_URL = "libsql://penplayhouse-adnanshahria19.aws-ap-south-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc3NDUyNzEsImlkIjoiMDE5ZGU5ZGYtYjMwMS03NjQ1LWJhOWUtOThiZTJiNWMwNjZlIiwicmlkIjoiYzgwZTRhZWItOThiMC00MGYzLWI0ZTAtY2E0NWM5ZmM3OTVlIn0.8GE2GMVjgmyQaZtUW9PQeg7PZbKofh7IZtVP_u3qG3uukowsCDkQtGjKsv3YjC2EJnHIYb8hHYkSLxJEIAiwAA";

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function syncSoldCounts() {
  console.log("🚀 Starting Real-Time Sold Count Synchronization...");
  
  try {
    // 1. Get all products
    const productsRes = await db.execute("SELECT id, title, sold_count FROM products");
    const products = productsRes.rows;
    
    console.log(`Found ${products.length} products. Recalculating sales from order history...`);
    
    let totalUpdated = 0;
    
    for (const product of products) {
      // 2. Sum quantity from order_items for this product
      // We only count items from orders that are NOT cancelled
      const salesRes = await db.execute({
        sql: `
          SELECT SUM(oi.quantity) as totalSold 
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE oi.product_id = ? AND LOWER(o.status) != 'cancelled'
        `,
        args: [product.id]
      });
      
      const realSold = Number(salesRes.rows[0].totalSold || 0);
      const currentSold = Number(product.sold_count || 0);
      
      if (realSold !== currentSold) {
        // 3. Update the products table with the authentic count
        await db.execute({
          sql: "UPDATE products SET sold_count = ? WHERE id = ?",
          args: [realSold, product.id]
        });
        console.log(`✅ Updated "${product.title}": ${currentSold} -> ${realSold}`);
        totalUpdated++;
      } else {
        console.log(`ℹ️ "${product.title}" already synced (${realSold} sold)`);
      }
    }
    
    console.log(`\n✨ Sync complete! Updated ${totalUpdated} products.`);
  } catch (error) {
    console.error("❌ Sync failed:", error);
  } finally {
    process.exit(0);
  }
}

syncSoldCounts();
