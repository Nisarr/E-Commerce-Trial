# Returns & Cancellations API

Endpoints for handling return requests and order cancellations.

## Endpoints

### List Returns
`GET /returns`

**Query Parameters:**
- `userId` (uuid, optional)
- `type` (string, optional): `return` or `cancellation`.

---

### Request Return/Cancellation
`POST /returns`

**Request Body:**
- `orderId` (uuid, required)
- `userId` (uuid, required)
- `reason` (string, required)
- `type` (string, required): `return` or `cancellation`.

---

### Update Return Status (Admin)
`PATCH /returns/:id`
