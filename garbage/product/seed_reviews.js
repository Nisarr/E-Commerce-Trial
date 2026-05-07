import { createClient } from '@libsql/client';

const TURSO_URL = "libsql://penplayhouse-adnanshahria19.aws-ap-south-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc3NDUyNzEsImlkIjoiMDE5ZGU5ZGYtYjMwMS03NjQ1LWJhOWUtOThiZTJiNWMwNjZlIiwicmlkIjoiYzgwZTRhZWItOThiMC00MGYzLWI0ZTAtY2E0NWM5ZmM3OTVlIn0.8GE2GMVjgmyQaZtUW9PQeg7PZbKofh7IZtVP_u3qG3uukowsCDkQtGjKsv3YjC2EJnHIYb8hHYkSLxJEIAiwAA";

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Fetching products...");
  const res = await db.execute("SELECT id, title FROM products LIMIT 5");
  const products = res.rows;

  if (products.length === 0) {
    console.log("No products found.");
    return;
  }

  const reviewers = [
    { name: "Sarah Johnson", rating: 5, comment: "Absolutely love this playpen! It's so sturdy and safe for my 8-month old.", title: "Excellent Quality" },
    { name: "David Miller", rating: 4, comment: "Very good product. Easy to assemble, although the delivery took a bit longer than expected.", title: "Great purchase" },
    { name: "Emily White", rating: 5, comment: "Beautiful design and fits perfectly in our living room. Highly recommend!", title: "Perfect for our home" }
  ];

  for (const product of products) {
    console.log(`Adding reviews for ${product.title}...`);
    
    // Clear existing reviews for these products to have a clean start (optional)
    // await db.execute({ sql: "DELETE FROM reviews WHERE product_id = ?", args: [product.id] });

    for (const rev of reviewers) {
      const id = crypto.randomUUID();
      await db.execute({
        sql: "INSERT INTO reviews (id, product_id, user_id, username, rating, title, content, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          id, 
          product.id, 
          crypto.randomUUID(), 
          rev.name, 
          rev.rating, 
          rev.title, 
          rev.comment, 
          1, 
          Date.now()
        ]
      });
    }

    // Update product stats
    const allReviews = await db.execute({
      sql: "SELECT rating FROM reviews WHERE product_id = ?",
      args: [product.id]
    });
    const avgRating = allReviews.rows.reduce((sum, r) => sum + r.rating, 0) / allReviews.rows.length;

    await db.execute({
      sql: "UPDATE products SET rating = ?, review_count = ? WHERE id = ?",
      args: [Math.round(avgRating * 10) / 10, allReviews.rows.length, product.id]
    });
  }

  console.log("Seeding complete!");
}

main().catch(console.error);
