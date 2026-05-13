import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const walletRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET — Read-only (preview data for trial)
walletRouter.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.req.query("userId");
  if (!userId) throw new Error("VAL: userId query parameter is required.");

  const rows = await db.query.walletTransactions.findMany({
    where: (t: any, { eq }: any) => eq(t.userId, userId),
    orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
  });
  const balance = rows.length > 0 ? (rows[0].balanceAfter ?? 0) : 0;

  return c.json({
    balance,
    items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/wallet", r.id) })),
    _links: formatLinks(c, "/wallet"),
  });
});

// MUTATIONS — Premium only (stubbed)
const premiumStub = (c: any) => c.json({
  error: "PremiumRequired",
  message: "This feature requires Premium. Contact Orbit SaaS to upgrade.",
  upgradeUrl: "https://orbitsaas.cloud/"
}, 403);

walletRouter.post("/topup", premiumStub);
walletRouter.post("/charge", premiumStub);
