import { Hono } from "hono";
import { Bindings, Variables } from "../shared";
import { sendEmail } from "../utils/email";

export const settingsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── POST /settings/test-email ───────────────────────
// Sends a test email to verify Gmail integration is working.
settingsRouter.post("/test-email", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.email) {
    throw new Error("VAL: Email address is required.");
  }

  if (!c.env.GOOGLE_SCRIPT_URL) {
    return c.json({
      error: "ConfigError",
      message: "GOOGLE_SCRIPT_URL is not configured. Please set it in your environment variables.",
    }, 503);
  }

  const success = await sendEmail(c.env.GOOGLE_SCRIPT_URL, c.env.EMAIL_WEBHOOK_SECRET, {
    to: body.email,
    subject: "PlayPen House — Test Email ✅",
    text: "If you received this, your email notifications are working correctly!",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 2px solid #22c55e;">
        <div style="text-align: center;">
          <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">🏠 PlayPen House</h1>
          <p style="color: #22c55e; font-size: 20px; font-weight: 700; margin: 16px 0;">✅ Email Integration Working!</p>
          <p style="color: #666; font-size: 14px;">This is a test email from your admin panel. Your notification system is configured correctly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 11px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      </div>
    `,
  });

  if (success) {
    return c.json({ message: "Test email sent successfully!" });
  } else {
    return c.json({ error: "EmailError", message: "Failed to send test email. Check your GOOGLE_SCRIPT_URL configuration." }, 500);
  }
});
