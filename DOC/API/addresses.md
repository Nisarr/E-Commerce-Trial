# Addresses API

Endpoints for managing customer shipping addresses.

## Endpoints

### List Addresses
`GET /addresses`

**Query Parameters:**
- `userId` (uuid, required)

---

### Create Address
`POST /addresses`

**Request Body:**
- `userId` (uuid, required)
- `fullName` (string, required)
- `phone` (string, required)
- `address` (string, required)
- `label` (string, default: "Home")
- `isDefault` (boolean, optional)

---

### Update Address
`PATCH /addresses/:id`

---

### Delete Address
`DELETE /addresses/:id`
