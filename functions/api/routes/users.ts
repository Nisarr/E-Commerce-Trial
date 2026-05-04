import { Hono } from "hono";
import { eq, like, desc, sql } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks, createPaginatedResponse } from "../shared";

export const usersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── GET /users ──────────────────────────────────────
// Admin: list all users with search and pagination
usersRouter.get("/", async (c) => {
  const db = c.get("db");
  const search = c.req.query("search");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = (page - 1) * limit;

  // Count total
  let countResult;
  if (search) {
    countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.users)
      .where(like(schema.users.username, `%${search}%`));
  } else {
    countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
  }
  const total = countResult[0]?.count || 0;

  // Fetch page
  let query = db.select({
    id: schema.users.id,
    username: schema.users.username,
    email: schema.users.email,
    phone: schema.users.phone,
    fullName: schema.users.fullName,
    avatar: schema.users.avatar,
    role: schema.users.role,
    isVerified: schema.users.isVerified,
    isBlocked: schema.users.isBlocked,
    createdAt: schema.users.createdAt,
  }).from(schema.users);

  if (search) {
    query = query.where(like(schema.users.username, `%${search}%`)) as any;
  }

  const rows = await (query as any).orderBy(desc(schema.users.createdAt)).limit(limit).offset(offset);

  return c.json(createPaginatedResponse(
    rows.map((r: any) => ({ ...r, _links: formatLinks(c, "/users", r.id) })),
    total,
    page,
    limit,
    formatLinks(c, "/users")
  ));
});

// ── GET /users/:id ──────────────────────────────────
usersRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [user] = await db.select({
    id: schema.users.id,
    username: schema.users.username,
    email: schema.users.email,
    phone: schema.users.phone,
    fullName: schema.users.fullName,
    avatar: schema.users.avatar,
    role: schema.users.role,
    isVerified: schema.users.isVerified,
    isBlocked: schema.users.isBlocked,
    createdAt: schema.users.createdAt,
  }).from(schema.users).where(eq(schema.users.id, id));

  if (!user) throw new Error(`User with ID ${id} not found`);

  return c.json({ ...user, _links: formatLinks(c, "/users", id) });
});

// ── PATCH /users/:id ────────────────────────────────
usersRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (!existing) throw new Error(`User with ID ${id} not found`);

  const updates: Record<string, any> = {};
  if (body.fullName !== undefined) updates.fullName = body.fullName;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.avatar !== undefined) updates.avatar = body.avatar;
  if (body.isVerified !== undefined) updates.isVerified = body.isVerified;
  if (body.isBlocked !== undefined) updates.isBlocked = body.isBlocked;
  if (body.role !== undefined) updates.role = body.role;

  if (Object.keys(updates).length > 0) {
    await db.update(schema.users).set(updates).where(eq(schema.users.id, id));
  }

  return c.json({
    message: "User updated successfully",
    _links: formatLinks(c, "/users", id),
  });
});

// ── PATCH /users/:id/password ───────────────────────
usersRouter.patch("/:id/password", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");
  const body = await c.req.json();

  if (!body?.currentPassword || !body?.newPassword) {
    throw new Error("VAL: Current password and new password are required.");
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (!user) throw new Error(`User with ID ${id} not found`);

  // Verify current password
  const encoder = new TextEncoder();
  const currentData = encoder.encode(body.currentPassword + "playpen-salt-2026");
  const currentHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", currentData)))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  if (currentHash !== user.passwordHash) {
    return c.json({ error: "Unauthorized", message: "Current password is incorrect" }, 401);
  }

  // Hash new password
  const newData = encoder.encode(body.newPassword + "playpen-salt-2026");
  const newHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", newData)))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  await db.update(schema.users).set({ passwordHash: newHash }).where(eq(schema.users.id, id));

  return c.json({ message: "Password updated successfully" });
});

// ── PATCH /users/:id/block ──────────────────────────
usersRouter.patch("/:id/block", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (!user) throw new Error(`User with ID ${id} not found`);

  const newStatus = user.isBlocked ? 0 : 1;
  await db.update(schema.users).set({ isBlocked: newStatus }).where(eq(schema.users.id, id));

  return c.json({
    message: newStatus ? "User blocked successfully" : "User unblocked successfully",
    isBlocked: newStatus,
  });
});

// ── PATCH /users/:id/verify ─────────────────────────
usersRouter.patch("/:id/verify", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (!user) throw new Error(`User with ID ${id} not found`);

  const newStatus = user.isVerified ? 0 : 1;
  await db.update(schema.users).set({ isVerified: newStatus }).where(eq(schema.users.id, id));

  return c.json({
    message: newStatus ? "User verified successfully" : "User unverified",
    isVerified: newStatus,
  });
});
