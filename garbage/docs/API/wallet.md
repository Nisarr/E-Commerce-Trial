# Wallet API

Endpoints for user wallet transactions and balance management.

## Endpoints

### Get Wallet Balance & History
`GET /wallet`

**Query Parameters:**
- `userId` (uuid, required)

---

### Top-up Wallet (Admin/Internal)
`POST /wallet/topup`

---

### Charge Wallet (Internal)
`POST /wallet/charge`
