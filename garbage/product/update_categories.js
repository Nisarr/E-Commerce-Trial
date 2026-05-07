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

const CATEGORY_IMAGE_MAP = {
  'Toys': '../catagory/toys.png',
  'Feeding': '../catagory/feeding.png',
  'Strollers': '../catagory/strollers.png',
  'Gear': '../catagory/gear.png',
  'Safety': '../catagory/safety.png',
  'Clothing': '../catagory/clothes.png',
  'Diapers': '../catagory/diapers.png',
  'Bath': '../catagory/bath.png',
  'Bedding': '../catagory/bedding.png',
  'Health': '../catagory/health.png',
  'Gifting': '../catagory/gifting.png',
  'Bottles': '../catagory/bottles.png',
  'Playpens': './playpen.png',
  'Play Mats': './baby_mat.png',
  'Furniture': './portable_travel_cot_1777915656203.png',
  'Electronics': './smart_baby_monitor_1777915690515.png',
  'Travel & Gear': '../catagory/gear.png',
  'Accessories': './musical_crib_mobile_1777915742334.png'
};

async function main() {
  console.log("Fetching categories from database...");
  const res = await db.execute("SELECT id, name FROM categories");
  const categories = res.rows;

  console.log(`Found ${categories.length} categories. Updating images...`);

  for (const cat of categories) {
    const imagePathRelative = CATEGORY_IMAGE_MAP[cat.name];
    if (imagePathRelative) {
      const imagePath = path.resolve(__dirname, imagePathRelative);
      if (fs.existsSync(imagePath)) {
        try {
          console.log(`Uploading image for ${cat.name}...`);
          const imgUrl = await uploadToImgBB(imagePath);
          console.log(`  URL: ${imgUrl}`);
          
          await db.execute({
            sql: "UPDATE categories SET image = ? WHERE id = ?",
            args: [imgUrl, cat.id]
          });
          console.log(`  Database updated for ${cat.name}`);
        } catch (error) {
          console.error(`  Failed to update ${cat.name}:`, error.message);
        }
      } else {
        console.warn(`  Image file not found for ${cat.name}: ${imagePath}`);
      }
    } else {
      console.log(`  No image mapping found for ${cat.name}`);
    }
  }

  console.log("All done!");
}

main().catch(console.error);
