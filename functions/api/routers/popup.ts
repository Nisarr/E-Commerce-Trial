import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const popupRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get popup settings
popupRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const [settings] = await db.select().from(schema.popupSettings).where(eq(schema.popupSettings.id, 1));

    if (!settings) {
      // Return default settings if none exist
      return c.json({
        id: 1,
        title: "Special Offer! 🎉",
        description: "Get Free Shipping on all orders over ৳5000. Limited time offer!",
        buttonText: "Claim Offer Now",
        link: "/products",
        imageUrl: "",
        isActive: 1,
      });
    }

    return c.json(settings);
  } catch (error: any) {
    console.error("Fetch popup settings error:", error.message);
    return c.json({ error: "FetchError", message: error.message }, 500);
  }
});

// Update popup settings
popupRouter.put("/", async (c) => {
  try {
    const db = c.get("db");
    const body = await c.req.json().catch(() => null);

    if (!body) throw new Error("VAL: Request body is required.");

    const [existing] = await db.select().from(schema.popupSettings).where(eq(schema.popupSettings.id, 1));

    const values = {
      title: body.title,
      description: body.description,
      buttonText: body.buttonText,
      link: body.link,
      imageUrl: body.imageUrl,
      isActive: body.isActive ? 1 : 0,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await db.update(schema.popupSettings).set(values).where(eq(schema.popupSettings.id, 1));
    } else {
      await db.insert(schema.popupSettings).values({ id: 1, ...values });
    }

    return c.json({ message: "Popup settings updated successfully" });
  } catch (error: any) {
    console.error("Update popup settings error:", error.message);
    return c.json({ error: "UpdateError", message: error.message }, 500);
  }
});
