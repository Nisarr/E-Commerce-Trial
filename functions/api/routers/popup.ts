import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const popupRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET — Read-only (needed for storefront popup display)
popupRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const [settings] = await db.select().from(schema.popupSettings).where(eq(schema.popupSettings.id, 1));
    if (!settings) {
      return c.json({
        id: 1, title: "Special Offer! 🎉",
        description: "Get Free Shipping on all orders over ৳5000. Limited time offer!",
        buttonText: "Claim Offer Now", link: "/products", imageUrl: "", isActive: 1,
      });
    }
    return c.json(settings);
  } catch (error: any) {
    console.error("Fetch popup settings error:", error.message);
    return c.json({ error: "FetchError", message: error.message }, 500);
  }
});

// MUTATIONS — Premium only (stubbed)
popupRouter.put("/", (c) => c.json({
  error: "PremiumRequired",
  message: "This feature requires Premium. Contact Orbit SaaS to upgrade.",
  upgradeUrl: "https://orbitsaas.cloud/"
}, 403));
