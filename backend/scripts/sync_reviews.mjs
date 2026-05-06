import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, and, sql } from "drizzle-orm";
import * as schema from "../server/db/schema.ts";
import fs from "fs";
import path from "path";

// Manual .dev.vars parsing
const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
if (fs.existsSync(devVarsPath)) {
  const content = fs.readFileSync(devVarsPath, "utf-8");
  content.split("\n").forEach(line => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, '');
    }
  });
}

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_URL is missing");
  process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

async function sync() {
  console.log("Starting review synchronization...");
  
  const allProducts = await db.select().from(schema.products);
  
  for (const product of allProducts) {
    const approvedReviews = await db.select().from(schema.reviews)
      .where(and(
        eq(schema.reviews.productId, product.id),
        eq(schema.reviews.status, "approved")
      ));
    
    const total = approvedReviews.length;
    const avgRating = total > 0 
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    
    const roundedRating = Math.round(avgRating * 10) / 10;
    
    if (product.rating !== roundedRating || product.reviewCount !== total) {
      console.log(`Updating product ${product.title}: ${product.rating} -> ${roundedRating}, ${product.reviewCount} -> ${total}`);
      await db.update(schema.products)
        .set({
          rating: roundedRating,
          reviewCount: total
        })
        .where(eq(schema.products.id, product.id));
    }
  }
  
  console.log("Synchronization complete.");
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
