import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { sign } from "hono/jwt";
import * as schema from "../../../backend/server/db/schema";
import type { Bindings, Variables } from "../types";
import { formatLinks } from "../utils/helpers";
import { checkRateLimit } from "../utils/rateLimiter";
import { sendEmail, otpEmailHtml, passwordResetEmailHtml } from "../utils/email";

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Rate Limit Middleware for Auth
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

// Helper: generate JWT
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

  // Simple hash
  const encoder = new TextEncoder();
  const data = encoder.encode(body.password + "playpen-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const tempId = crypto.randomUUID();

  // Store registration data in metadata for later creation
  const registrationData = {
    username: body.username,
    email: body.email || null,
    phone: body.phone || null,
    passwordHash,
    fullName: body.fullName || body.username,
    createdAt: new Date().toISOString()
  };

  // Generate OTP for email verification
  if (body.email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(schema.otpCodes).values({
      id: crypto.randomUUID(),
      userId: tempId, // Use tempId to track this pending registration
      code,
      type: "email_verify",
      metadata: JSON.stringify(registrationData),
      expiresAt,
      createdAt: new Date(),
    });

    // Send OTP via email (Background)
    const verifyEmailPromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: body.email,
      subject: "PlayPen House — Verify Your Email",
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html: otpEmailHtml(code, body.username),
    }).catch(err => console.error("[EMAIL] Registration verify email failed:", err));

    if (c.executionCtx) c.executionCtx.waitUntil(verifyEmailPromise);

    return c.json({
      id: tempId,
      username: body.username,
      message: "Check your email for the verification code. Your account will be created once verified.",
      _links: formatLinks(c, "/users", tempId),
    }, 201);
  } else {
    // If no email provided, we still follow the "no account until verified" rule?
    // Usually registration requires email/phone. If no email, we can't verify.
    throw new Error("VAL: Email is required for registration verification.");
  }
});

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

  // If this is a pending registration, create the user account now
  if (validOtp.type === "email_verify" && validOtp.metadata) {
    try {
      const data = JSON.parse(validOtp.metadata);
      
      // Final check if user/email was taken by another process in the meantime
      const [existingUser] = await db.select().from(schema.users).where(eq(schema.users.username, data.username));
      const [existingEmail] = data.email ? await db.select().from(schema.users).where(eq(schema.users.email, data.email)) : [null];
      
      if (existingUser || existingEmail) {
        return c.json({ 
          error: "Conflict", 
          message: "This username or email has already been taken. Please register again with different details." 
        }, 409);
      }

      await db.insert(schema.users).values({
        id: body.userId, // Use the tempId from registration
        username: data.username,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        isVerified: 1,
        createdAt: new Date(data.createdAt || Date.now()),
      });
    } catch (err) {
      console.error("Failed to create user from metadata:", err);
      throw new Error("InternalServerError: Failed to finalize registration.");
    }
  } else {
    // Normal verification for existing user
    await db.update(schema.users)
      .set({ isVerified: 1 })
      .where(eq(schema.users.id, body.userId));
  }

  // Mark OTP as used
  await db.update(schema.otpCodes)
    .set({ used: 1 })
    .where(eq(schema.otpCodes.id, validOtp.id));

  return c.json({ message: "Email verified successfully. Your account is now active." });
});

authRouter.post("/resend-otp", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.userId) {
    throw new Error("VAL: userId is required.");
  }

  const [user] = await db.select().from(schema.users)
    .where(eq(schema.users.id, body.userId));

  let email = user?.email;
  let username = user?.username || "User";

  // If user not found, check if it's a pending registration
  if (!user) {
    const [pendingOtp] = await db.select().from(schema.otpCodes)
      .where(eq(schema.otpCodes.userId, body.userId))
      .limit(1);
    
    if (pendingOtp?.metadata) {
      const data = JSON.parse(pendingOtp.metadata);
      email = data.email;
      username = data.username;
    } else {
      throw new Error("User not found");
    }
  }

  // Generate a 6-digit OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Transfer metadata if it was a pending registration
  const [lastOtp] = await db.select().from(schema.otpCodes)
    .where(eq(schema.otpCodes.userId, body.userId))
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);

  await db.insert(schema.otpCodes).values({
    id: crypto.randomUUID(),
    userId: body.userId,
    code,
    type: "email_verify",
    metadata: lastOtp?.metadata || null,
    expiresAt,
    createdAt: new Date(),
  });

  // Send OTP via email (Background)
  if (email) {
    const resendOtpPromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
      to: email,
      subject: "PlayPen House — Your Verification Code",
      text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      html: otpEmailHtml(code, username),
    }).catch(err => console.error("[EMAIL] Resend OTP email failed:", err));

    if (c.executionCtx) c.executionCtx.waitUntil(resendOtpPromise);
  }

  return c.json({ message: "OTP sent successfully." });
});

authRouter.post("/forgot-password", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.email) {
    throw new Error("VAL: Email is required.");
  }

  const [user] = await db.select().from(schema.users)
    .where(eq(schema.users.email, body.email));

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

  // Send reset email (Background)
  const forgotPasswordPromise = sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
    to: user.email!,
    subject: "PlayPen House — Password Reset Code",
    text: `Your password reset code is: ${code}. It expires in 10 minutes.`,
    html: passwordResetEmailHtml(code, user.email!),
  }).catch(err => console.error("[EMAIL] Forgot password email failed:", err));

  if (c.executionCtx) c.executionCtx.waitUntil(forgotPasswordPromise);

  return c.json({ message: "If an account with that email exists, a reset code has been sent." });
});

authRouter.post("/reset-password", async (c) => {
  const db = c.get("db");
  const body = await c.req.json().catch(() => null);

  if (!body?.email || !body?.code || !body?.newPassword) {
    throw new Error("VAL: email, code and newPassword are required.");
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, body.email));
  if (!user) {
    return c.json({ error: "ValidationError", message: "Invalid email or code." }, 422);
  }

  const otpRecords = await db.select().from(schema.otpCodes).where(eq(schema.otpCodes.userId, user.id));
  const validOtp = otpRecords.find(
    (otp) => otp.code === body.code && !otp.used && otp.type === "password_reset" &&
      new Date(otp.expiresAt!).getTime() > Date.now()
  );

  if (!validOtp) {
    return c.json({ error: "ValidationError", message: "Invalid or expired reset code." }, 422);
  }

  // Update password
  const encoder = new TextEncoder();
  const data = encoder.encode(body.newPassword + "playpen-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, user.id));
  await db.update(schema.otpCodes).set({ used: 1 }).where(eq(schema.otpCodes.id, validOtp.id));

  return c.json({ message: "Password reset successful." });
});
