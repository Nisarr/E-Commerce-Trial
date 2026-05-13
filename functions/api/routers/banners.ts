import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const bannersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET — Read-only (preview data for trial)
bannersRouter.get("/", async (c) => {
  try {
    const position = c.req.query("position");
    const db = c.get("db");
    const rows = await db.query.banners.findMany({
      where: position ? (b: any, { eq }: any) => eq(b.position, position) : undefined,
      orderBy: (b: any, { asc }: any) => [asc(b.order)],
    });
    return c.json({
      items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/banners", r.id) })),
      _links: formatLinks(c, "/banners")
    });
  } catch (error: any) {
    console.error("Fetch banners error:", error.message);
    return c.json({ items: [], _links: formatLinks(c, "/banners") });
  }
});

// MUTATIONS — Premium only (stubbed)
const premiumStub = (c: any) => c.json({
  error: "PremiumRequired",
  message: "This feature requires Premium. Contact Orbit SaaS to upgrade.",
  upgradeUrl: "https://orbitsaas.cloud/"
}, 403);

bannersRouter.post("/", premiumStub);
bannersRouter.patch("/:id", premiumStub);
bannersRouter.delete("/:id", premiumStub);
