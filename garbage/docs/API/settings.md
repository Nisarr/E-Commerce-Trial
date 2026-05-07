# Settings API

Endpoints for system settings and testing.

## Endpoints

### Test Email Integration
`POST /settings/test-email`

Sends a test email to verify that the Gmail/Google Script integration is correctly configured.

**Request Body:**
- `email` (string, required): The recipient email address for the test.

**Response (200 OK):**
```json
{
  "message": "Test email sent successfully!"
}
```

**Security:**
- Requires Admin API Key.
- Dependent on `GOOGLE_SCRIPT_URL` environment variable.
