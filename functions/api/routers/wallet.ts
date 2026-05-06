import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";

export const walletRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

walletRouter.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.req.query("userId");

  if (!userId) {
    throw new Error("VAL: userId query parameter is required.");
  }

  const rows = await db.query.walletTransactions.findMany({
    where: (t: any, { eq }: any) => eq(t.userId, userId),
    orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
  });

  // Calculate current balance
  const balance = rows.length > 0 ? (rows[0].balanceAfter ?? 0) : 0;

  return c.json({
    balance,
    items: rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/wallet", r.id) })),
    _links: formatLinks(c, "/wallet"),
  });
});

walletRouter.post("/topup", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.userId || !body?.amount || body.amount <= 0) {
    throw new Error("VAL: userId and a positive amount are required.");
  }

  const id = crypto.randomUUID();
  const userId = body.userId;
  const amount = Number(body.amount);

  // Get current balance
  const rows = await db.query.walletTransactions.findMany({
    where: (t: any, { eq }: any) => eq(t.userId, userId),
    orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
    limit: 1,
  });

  const currentBalance = rows.length > 0 ? (rows[0].balanceAfter ?? 0) : 0;
  const newBalance = currentBalance + amount;

  await db.insert(schema.walletTransactions).values({
    id,
    userId,
    amount,
    type: "credit",
    reference: body.reference || "Top-up",
    balanceAfter: newBalance,
    createdAt: new Date(),
  });

  return c.json({
    id,
    balanceAfter: newBalance,
    message: "Wallet topped up successfully",
    _links: formatLinks(c, "/wallet", id),
  }, 201);
});

walletRouter.post("/charge", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.userId || !body?.amount || body.amount <= 0) {
    throw new Error("VAL: userId and a positive amount are required.");
  }

  const id = crypto.randomUUID();
  const userId = body.userId;
  const amount = Number(body.amount);

  // Get current balance
  const rows = await db.query.walletTransactions.findMany({
    where: (t: any, { eq }: any) => eq(t.userId, userId),
    orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
    limit: 1,
  });

  const currentBalance = rows.length > 0 ? (rows[0].balanceAfter ?? 0) : 0;

  if (currentBalance < amount) {
    throw new Error("VAL: Insufficient wallet balance.");
  }

  const newBalance = currentBalance - amount;

  await db.insert(schema.walletTransactions).values({
    id,
    userId,
    amount,
    type: "debit",
    reference: body.reference || "Payment",
    balanceAfter: newBalance,
    createdAt: new Date(),
  });

  return c.json({
    id,
    balanceAfter: newBalance,
    message: "Wallet charged successfully",
    _links: formatLinks(c, "/wallet", id),
  }, 201);
});
