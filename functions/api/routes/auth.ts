import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import * as schema from "../../../backend/server/db/schema";
import { Bindings, Variables, formatLinks } from "../shared";
import { checkRateLimit } from "../utils/rateLimiter";
import {
  sendEmail,
  otpEmailHtml,
  passwordResetEmailHtml,
} from "../utils/email";

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── Rate Limit Middleware for Auth ──────────────────────
authRouter.use("*", async (c, next) => {
  const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
  const path = c.req.path;
  const key = `auth:${ip}:${path}`;

  const { limited, remaining, resetAt } = checkRateLimit(key, 10, 60_000); // 10 req/min per route

  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

  if (limited) {
    return c.json({
      error: "TooManyRequests",
      message: "Too many attempts. Please wait a moment and try again.",
    }, 429);
  }

  await next();
});

// ── Helper: generate JWT ────────────────────────────────
async function generateToken(
  user: { id: string; username: string; email?: string | null; role?: string },
  secret: string
): Promise<string> {
  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email || undefined,
    role: user.role || "user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  return await sign(payload, secret);
}

// ── POST /auth/register ─────────────────────────────
authRouter.post("/register", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.username || !body?.password) {
    throw new Error("VAL: Username and password are required.");
  }

  // Check if username already exists
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, body.username));

  if (existing) {
    throw new Error("VAL: A user with this username already exists.");
  }

  // Check if email already exists (if provided)
  if (body.email) {
    const [emailExists] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email));
    if (emailExists) {
      throw new Error("VAL: A user with this email already exists.");
    }
  }

  // Simple hash (for production, use bcrypt/argon2 via a worker-compatible lib)
  const encoder = new TextEncoder();
  const data = encoder.encode(body.password + "playpen-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const id = crypto.randomUUID();

  await db.insert(schema.users).values({
    id,
    username: body.username,
    email: body.email || null,
    phone: body.phone || null,
    passwordHash,
    fullName: body.fullName || body.username,
    isVerified: 0,
    createdAt: new Date(),
  });

  // Generate OTP for email verification if email is provided
  if (body.email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(schema.otpCodes).values({
      id: crypto.randomUUID(),
      userId: id,
      code,
      type: "email_verify",
      expiresAt,
      createdAt: new Date(),
    });

    // Send OTP via email
    await sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: body.email,
      subject: "PlayPen House — Verify Your Email",
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html: otpEmailHtml(code, body.username),
    });
  }

  return c.json({
    id,
    username: body.username,
    message: body.email
      ? "Account created! Check your email for the verification code."
      : "Account created successfully.",
    _links: formatLinks(c, "/users", id),
  }, 201);
});

// ── POST /auth/login ─────────────────────────────────
authRouter.post("/login", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.username || !body?.password) {
    throw new Error("VAL: Username/email and password are required.");
  }

  // Try to find by username or email
  let user;
  const [byUsername] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, body.username));

  if (byUsername) {
    user = byUsername;
  } else if (body.username.includes("@")) {
    const [byEmail] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.username));
    user = byEmail;
  }

  if (!user) {
    return c.json({ error: "Unauthorized", message: "Invalid credentials" }, 401);
  }

  // Verify password
  const encoder = new TextEncoder();
  const data = encoder.encode(body.password + "playpen-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  if (passwordHash !== user.passwordHash) {
    return c.json({ error: "Unauthorized", message: "Invalid credentials" }, 401);
  }

  // Generate JWT
  const token = await generateToken(
    { id: user.id, username: user.username, email: user.email },
    c.env.JWT_SECRET || "fallback-dev-secret-change-me"
  );

  return c.json({
    token,
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatar: user.avatar,
    isVerified: user.isVerified,
    role: "user",
    message: "Login successful",
  });
});

// ── POST /auth/verify-otp ───────────────────────────
authRouter.post("/verify-otp", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.userId || !body?.code) {
    throw new Error("VAL: userId and code are required.");
  }

  // Find the most recent unused OTP for this user
  const otpRecords = await db.select().from(schema.otpCodes)
    .where(eq(schema.otpCodes.userId, body.userId));

  const validOtp = otpRecords.find(
    (otp) => otp.code === body.code && !otp.used && otp.type === "email_verify" &&
    new Date(otp.expiresAt!).getTime() > Date.now()
  );

  if (!validOtp) {
    return c.json({ error: "ValidationError", message: "Invalid or expired OTP code." }, 422);
  }

  // Mark OTP as used
  await db.update(schema.otpCodes)
    .set({ used: 1 })
    .where(eq(schema.otpCodes.id, validOtp.id));

  // Mark user as verified
  await db.update(schema.users)
    .set({ isVerified: 1 })
    .where(eq(schema.users.id, body.userId));

  return c.json({ message: "Email verified successfully." });
});

// ── POST /auth/resend-otp ───────────────────────────
authRouter.post("/resend-otp", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.userId) {
    throw new Error("VAL: userId is required.");
  }

  const [user] = await db.select().from(schema.users)
    .where(eq(schema.users.id, body.userId));

  if (!user) throw new Error("User not found");

  // Generate a 6-digit OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(schema.otpCodes).values({
    id: crypto.randomUUID(),
    userId: body.userId,
    code,
    type: "email_verify",
    expiresAt,
    createdAt: new Date(),
  });

  // Send OTP via email
  if (user.email) {
    await sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: user.email,
      subject: "PlayPen House — Your Verification Code",
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html: otpEmailHtml(code, user.username),
    });
  }

  return c.json({ message: "OTP sent successfully." });
});

// ── POST /auth/forgot-password ──────────────────────
authRouter.post("/forgot-password", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.email) {
    throw new Error("VAL: Email is required.");
  }

  const [user] = await db.select().from(schema.users)
    .where(eq(schema.users.email, body.email));

  // Don't reveal if user exists
  if (!user) {
    return c.json({ message: "If an account with that email exists, a reset code has been sent." });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(schema.otpCodes).values({
    id: crypto.randomUUID(),
    userId: user.id,
    code,
    type: "password_reset",
    expiresAt,
    createdAt: new Date(),
  });

  // Send reset email
  await sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
    to: user.email!,
    subject: "PlayPen House — Password Reset Code",
    text: `Your password reset code is: ${code}. It expires in 10 minutes.`,
    html: passwordResetEmailHtml(code, user.email!),
  });

  return c.json({ message: "If an account with that email exists, a reset code has been sent." });
});

// ── POST /auth/reset-password ───────────────────────
authRouter.post("/reset-password", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.email || !body?.code || !body?.newPassword) {
    throw new Error("VAL: Email, code, and new password are required.");
  }

  const [user] = await db.select().from(schema.users)
    .where(eq(schema.users.email, body.email));

  if (!user) {
    return c.json({ error: "ValidationError", message: "Invalid reset request." }, 422);
  }

  const otpRecords = await db.select().from(schema.otpCodes)
    .where(eq(schema.otpCodes.userId, user.id));

  const validOtp = otpRecords.find(
    (otp) => otp.code === body.code && !otp.used && otp.type === "password_reset" &&
    new Date(otp.expiresAt!).getTime() > Date.now()
  );

  if (!validOtp) {
    return c.json({ error: "ValidationError", message: "Invalid or expired reset code." }, 422);
  }

  // Mark OTP as used
  await db.update(schema.otpCodes)
    .set({ used: 1 })
    .where(eq(schema.otpCodes.id, validOtp.id));

  // Hash new password
  const encoder = new TextEncoder();
  const data = encoder.encode(body.newPassword + "playpen-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  await db.update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, user.id));

  return c.json({ message: "Password reset successfully. You can now log in." });
});
