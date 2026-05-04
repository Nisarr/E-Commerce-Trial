# 🔑 Environment Variables Setup

Once you have deployed your Google Apps Script, you need to tell your application how to connect to it.

Open your `.dev.vars` and `.env` files in the root of your project and fill in the following values:

```env
# The URL you copied from Step 2 of the README (Web App URL)
GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"

# The secret string you created in Step 3 of the README
EMAIL_WEBHOOK_SECRET="your-random-secret-string"

# The Gmail address you used to create the script
GMAIL_SENDER_EMAIL="your.email@gmail.com"

# Where you want admin notifications (like new orders) to be sent
ADMIN_NOTIFICATION_EMAIL="your.email@gmail.com"
```

*Note: For production (Cloudflare Pages), you will also need to add these exact same variables in:*
**Cloudflare Dashboard → Pages → your-project → Settings → Environment Variables**
