import { Hono } from "hono";
import { eq, or, and, isNull, count, desc } from "drizzle-orm";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";

export const notificationsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

notificationsRouter.get("/", async (c) => {
  try {
    const db = c.get("db");
    const userId = c.req.query("userId");
    const isAdminView = c.req.query("all") === "true";

    const rows = await db.query.notifications.findMany({
      where: isAdminView 
        ? undefined 
        : userId
          ? or(eq(schema.notifications.userId, userId), isNull(schema.notifications.userId))
          : isNull(schema.notifications.userId),
      orderBy: (n: any, { desc }: any) => [desc(n.createdAt)],
    });

    return c.json({ items: rows });
  } catch (error: any) {
    console.error("Fetch notifications error:", error.message);
    return c.json({ items: [] });
  }
});

notificationsRouter.get("/check", async (c) => {
  try {
    const db = c.get("db");
    const userId = c.req.query("userId");

    const whereFilter = userId
      ? or(eq(schema.notifications.userId, userId), isNull(schema.notifications.userId))
      : isNull(schema.notifications.userId);

    const [unreadResult] = await db
      .select({ value: count() })
      .from(schema.notifications)
      .where(and(whereFilter, eq(schema.notifications.isRead, 0)));

    const latest = await db.query.notifications.findFirst({
      where: whereFilter,
      orderBy: (n: any, { desc }: any) => [desc(n.createdAt)],
      columns: { id: true, createdAt: true },
    });

    return c.json({
      unreadCount: unreadResult?.value ?? 0,
      latestId: latest?.id ?? null,
      latestAt: latest?.createdAt ?? null,
    });
  } catch (error: any) {
    console.error("Check notifications error:", error.message);
    return c.json({ unreadCount: 0, latestId: null, latestAt: null });
  }
});

notificationsRouter.post("/", async (c) => {
  try {
    const db = c.get("db");
    const body = await c.req.json().catch(() => null);

    if (!body?.title || !body?.message) {
      throw new Error("VAL: Title and message are required.");
    }

    const id = crypto.randomUUID();
    await db.insert(schema.notifications).values({
      id,
      userId: body.userId || null,
      title: body.title,
      message: body.message,
      type: body.type || "info",
      isRead: 0,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id, message: "Notification sent successfully" }, 201);
  } catch (error: any) {
    console.error("Create notification error:", error.message);
    return c.json({ error: error.message }, 400);
  }
});

notificationsRouter.post("/:id/read", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.get("db");

    await db.update(schema.notifications)
      .set({ isRead: 1 })
      .where(eq(schema.notifications.id, id));

    return c.json({ message: "Notification marked as read." });
  } catch (error: any) {
    console.error("Mark read error:", error.message);
    return c.json({ error: error.message }, 400);
  }
});
