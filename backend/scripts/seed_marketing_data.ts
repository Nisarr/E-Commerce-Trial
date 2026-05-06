
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const client = createClient({
    url: process.env.TURSO_URL || "file:dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  console.log("Seeding marketing data for products...");

  const products = await db.query.products.findMany({ limit: 5 });

  if (products.length === 0) {
    console.log("No products found to update.");
    return;
  }

  for (const product of products) {
    console.log(`Updating product: ${product.title}`);

    const highlights = JSON.stringify([
      { title: "BPA-Free", description: "Safe for your baby's skin and health." },
      { title: "Tool-less Setup", description: "Assemble in under 15 minutes." },
      { title: "Anti-Slip", description: "Strong suction cups for maximum stability." },
      { title: "Modular", description: "Expand or shrink as per your room size." }
    ]);

    const howItWorks = JSON.stringify([
      { title: "Unbox", description: "Lay out the panels in your desired shape." },
      { title: "Connect", description: "Slide the panels into each other until they click." },
      { title: "Lock", description: "Engage the safety locks for ultimate security." }
    ]);

    const faqs = JSON.stringify([
      { question: "Is it safe for toddlers?", answer: "Yes, it is EN71 certified and made from non-toxic materials." },
      { question: "Can I use it outdoors?", answer: "Yes, but we recommend using it on flat surfaces for stability." },
      { question: "How do I clean it?", answer: "Simply wipe with a damp cloth and mild soap." }
    ]);

    const trustBadges = JSON.stringify([
      { label: "EN71 Certified" },
      { label: "1 Year Warranty" },
      { label: "Free Shipping" }
    ]);

    const comparisonData = JSON.stringify({
      headers: ["Feature", "Our Product", "Others"],
      rows: [
        ["Material", "BPA-Free HDPE", "Recycled Plastic"],
        ["Stability", "Strong Suction", "Rubber Pads"],
        ["Safety Lock", "One-Hand Slide", "Basic Latch"]
      ]
    });

    const qna = JSON.stringify([
      { question: "Is this foldable?", answer: "Yes, it can be folded flat for storage when not in use.", date: "May 2024" }
    ]);

    // Set deadline to 3 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    await db.update(schema.products)
      .set({
        highlights,
        howItWorks,
        faqs,
        trustBadges,
        comparisonData,
        qna,
        deliveryInfo: "3-5 Days Delivery",
        warrantyInfo: "1 Year Warranty",
        offerDeadline: deadline,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample video
        specSheetUrl: "https://www.example.com/spec-sheet.pdf"
      })
      .where(eq(schema.products.id, product.id));
  }

  console.log("Database updated successfully!");
  process.exit(0);
}

main().catch(console.error);
