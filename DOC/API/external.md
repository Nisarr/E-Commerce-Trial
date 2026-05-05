# External & Integrated APIs

Documentation for third-party services and internal webhooks integrated into PlayPen House.

## 1. ImgBB API (Image Hosting)

Used for uploading and hosting product and review images.

**Endpoint**: `POST https://api.imgbb.com/1/upload`
**Key Source**: `VITE_IMGBB_API_KEY` (Frontend)

**Usage**:
- Frontend components upload files directly to ImgBB.
- The returned URL is then sent to the PlayPen House API to be stored in the database.

---

## 2. Google Script Email Webhook (Internal)

A private API hosted on Google Apps Script to bridge the application with Gmail for sending transactional emails.

**Endpoint**: `POST [GOOGLE_SCRIPT_URL]`
**Authentication**: `EMAIL_WEBHOOK_SECRET`

**Functionality**:
- **Authentication**: Verifies a secret token in the request body.
- **Action**: Sends emails using `GmailApp.sendEmail`.
- **Supported Fields**: `to`, `subject`, `text`, `html`, `senderName`.

**Integrated Emails**:
- OTP Verification.
- Password Reset.
- Order Confirmation (Customer & Admin).
- Order Status Updates.
- Tracking Updates.
