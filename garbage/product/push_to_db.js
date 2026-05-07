import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMGBB_API_KEY = "72e829fc89d4e37decb405dace50ba5c";
const TURSO_URL = "libsql://penplayhouse-adnanshahria19.aws-ap-south-1.turso.io";
const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc3NDUyNzEsImlkIjoiMDE5ZGU5ZGYtYjMwMS03NjQ1LWJhOWUtOThiZTJiNWMwNjZlIiwicmlkIjoiYzgwZTRhZWItOThiMC00MGYzLWI0ZTAtY2E0NWM5ZmM3OTVlIn0.8GE2GMVjgmyQaZtUW9PQeg7PZbKofh7IZtVP_u3qG3uukowsCDkQtGjKsv3YjC2EJnHIYb8hHYkSLxJEIAiwAA";

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function uploadToImgBB(imagePath) {
  const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
  
  const formData = new URLSearchParams();
  formData.append('image', base64Image);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  if (result.success) {
    return result.data.url;
  } else {
    throw new Error(`ImgBB upload failed: ${result.error?.message || JSON.stringify(result)}`);
  }
}

function generateId(prefix = 'prod') {
  return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substr(2, 5);
}

async function getOrCreateCategory(categoryName) {
  const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  // Check if exists
  const res = await db.execute({
    sql: "SELECT id FROM categories WHERE name = ?",
    args: [categoryName]
  });
  
  if (res.rows.length > 0) {
    return res.rows[0].id;
  }
  
  // Create new
  const id = generateId('cat');
  await db.execute({
    sql: "INSERT INTO categories (id, name, slug, is_active) VALUES (?, ?, ?, ?)",
    args: [id, categoryName, slug + '-' + Math.random().toString(36).substr(2, 5), 1]
  });
  
  console.log(`  Created new category: ${categoryName} (${id})`);
  return id;
}

async function main() {
  const productsPath = path.join(__dirname, 'extra_products.json');
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  console.log(`Found ${productsData.length} extra products. Starting upload and database insertion...`);

  for (const item of productsData) {
    try {
      console.log(`Processing: ${item.name}`);
      
      // Upload image
      const imagePath = path.join(__dirname, item.image);
      const imgUrl = await uploadToImgBB(imagePath);
      console.log(`  Uploaded image: ${imgUrl}`);

      // Get category id
      const categoryId = await getOrCreateCategory(item.category);

      // Insert to DB
      const id = generateId('prod');
      const slug = generateSlug(item.name);
      const imagesJson = JSON.stringify([imgUrl]);
      const tagsJson = JSON.stringify(item.tags);
      
      const price = item.price;
      const sale_price = Math.round(price * 0.9); 
      const stock = 50;
      const rating = 4.5 + Math.random() * 0.5; 
      const review_count = Math.floor(Math.random() * 100) + 10;
      const sold_count = Math.floor(Math.random() * 50);

      await db.execute({
        sql: `INSERT INTO products (
          id, title, slug, category_id, brand, price, sale_price, 
          stock, images, tags, rating, review_count, 
          is_active, created_at, low_stock_threshold, sold_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, 
          item.name, 
          slug, 
          categoryId,
          item.brand || "Baby Pen House", 
          price, 
          sale_price,
          stock, 
          imagesJson, 
          tagsJson, 
          rating,
          review_count,
          1, // is_active
          Date.now(), 
          5, // low_stock_threshold
          sold_count
        ]
      });
      
      console.log(`  Inserted into DB with id: ${id}`);
    } catch (error) {
      console.error(`Error processing ${item.name}:`, error);
    }
  }

  console.log('All done!');
}

main().catch(console.error);
