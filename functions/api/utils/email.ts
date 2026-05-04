// ── Email Utility (Google Apps Script Webhook) ─────────────
// Sends emails via a deployed Google Apps Script that uses
// GmailApp.sendEmail() — fully compatible with Cloudflare Workers/Pages.
//
// Setup:
// 1. Create a Google Apps Script at https://script.google.com
// 2. Paste the doPost handler (see below)
// 3. Deploy as Web App → "Anyone" can access
// 4. Copy the URL → put in GOOGLE_SCRIPT_URL env var

/**
 * Google Apps Script code to deploy:
 * 
 * function doPost(e) {
 *   var data = JSON.parse(e.postData.contents);
 *   
 *   var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
 *   if (secret && data.secret !== secret) {
 *     return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *
 *   GmailApp.sendEmail(data.to, data.subject, data.text, {
 *     htmlBody: data.html,
 *     name: data.senderName || "PlayPen House"
 *   });
 *   return ContentService.createTextOutput(JSON.stringify({ success: true }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 */

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  senderName?: string;
}

/**
 * Send an email via the Google Apps Script webhook.
 * Returns true on success, false on failure (never throws).
 */
export async function sendEmail(
  scriptUrl: string,
  webhookSecret: string | undefined,
  payload: EmailPayload
): Promise<boolean> {
  if (!scriptUrl) {
    console.warn("[EMAIL] GOOGLE_SCRIPT_URL not set — email skipped:", payload.subject);
    return false;
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html || payload.text,
        senderName: payload.senderName || "PlayPen House",
      }),
    });

    if (!res.ok) {
      console.error("[EMAIL] Script returned non-OK:", res.status, await res.text());
      return false;
    }

    console.log("[EMAIL] Sent successfully to:", payload.to, "subject:", payload.subject);
    return true;
  } catch (err: any) {
    console.error("[EMAIL] Failed to send:", err.message);
    return false;
  }
}

// ── Email Templates ──────────────────────────────────────

export function otpEmailHtml(code: string, username: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #eee;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">🏠 PlayPen House</h1>
        <p style="color: #888; font-size: 14px; margin: 8px 0 0;">Email Verification</p>
      </div>
      <p style="color: #333; font-size: 15px; line-height: 1.6;">Hi <strong>${username}</strong>,</p>
      <p style="color: #333; font-size: 15px; line-height: 1.6;">Your verification code is:</p>
      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #fff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px;">
          ${code}
        </div>
      </div>
      <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 11px; text-align: center;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
}

export function passwordResetEmailHtml(code: string, email: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #eee;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">🏠 PlayPen House</h1>
        <p style="color: #888; font-size: 14px; margin: 8px 0 0;">Password Reset</p>
      </div>
      <p style="color: #333; font-size: 15px; line-height: 1.6;">A password reset was requested for <strong>${email}</strong>.</p>
      <p style="color: #333; font-size: 15px; line-height: 1.6;">Your reset code is:</p>
      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px;">
          ${code}
        </div>
      </div>
      <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 11px; text-align: center;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
}

export function orderConfirmationEmailHtml(
  invoiceId: string,
  customerName: string,
  totalAmount: number,
  items: { name: string; quantity: number; price: number }[]
): string {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${item.name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #eee;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">🏠 PlayPen House</h1>
        <p style="color: #22c55e; font-size: 14px; font-weight: 700; margin: 8px 0 0;">✅ Order Confirmed</p>
      </div>
      <p style="color: #333; font-size: 15px;">Hi <strong>${customerName}</strong>,</p>
      <p style="color: #333; font-size: 15px;">Your order <strong>${invoiceId}</strong> has been placed successfully and is awaiting approval.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888;">Item</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #888;">Qty</th>
            <th style="padding: 8px 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #888;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align: right; margin-top: 12px; font-size: 18px; font-weight: 900; color: #1a1a2e;">
        Total: $${totalAmount.toFixed(2)}
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 11px; text-align: center;">Thank you for shopping with PlayPen House!</p>
    </div>
  `;
}

export function adminNewOrderEmailHtml(
  invoiceId: string,
  customerName: string,
  totalAmount: number,
  itemCount: number
): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 2px solid #f59e0b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">🏠 PlayPen House — Admin</h1>
        <p style="color: #f59e0b; font-size: 14px; font-weight: 700; margin: 8px 0 0;">🔔 New Order Awaiting Approval</p>
      </div>
      <table style="width: 100%; font-size: 15px; color: #333;">
        <tr><td style="padding: 6px 0; font-weight: 700;">Invoice</td><td>${invoiceId}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 700;">Customer</td><td>${customerName}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 700;">Items</td><td>${itemCount} item(s)</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 700;">Total</td><td style="font-size: 18px; font-weight: 900; color: #22c55e;">$${totalAmount.toFixed(2)}</td></tr>
      </table>
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #888; font-size: 13px;">Please log in to the Admin Panel to approve or reject this order.</p>
      </div>
    </div>
  `;
}

export function orderStatusUpdateEmailHtml(
  invoiceId: string,
  customerName: string,
  newStatus: string,
  message?: string
): string {
  const statusColors: Record<string, string> = {
    Processing: "#3b82f6",
    Shipped: "#8b5cf6",
    "Out for Delivery": "#f59e0b",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
  };
  const color = statusColors[newStatus] || "#6b7280";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #eee;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">🏠 PlayPen House</h1>
        <p style="color: #888; font-size: 14px; margin: 8px 0 0;">Order Update</p>
      </div>
      <p style="color: #333; font-size: 15px;">Hi <strong>${customerName}</strong>,</p>
      <p style="color: #333; font-size: 15px;">Your order <strong>${invoiceId}</strong> has been updated:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; background: ${color}; color: #fff; font-size: 16px; font-weight: 700; padding: 10px 28px; border-radius: 999px;">
          ${newStatus}
        </span>
      </div>
      ${message ? `<p style="color: #555; font-size: 14px; text-align: center; font-style: italic;">"${message}"</p>` : ""}
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 11px; text-align: center;">Thank you for shopping with PlayPen House!</p>
    </div>
  `;
}
