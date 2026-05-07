# Coupons API

Endpoints for managing and validating discount coupons.

## Endpoints

### List Coupons (Admin)
`GET /coupons`

---

### Validate Coupon
`POST /coupons/validate`

Checks if a coupon is valid for a set of items and calculates the discount.

**Request Body:**
- `code` (string, required)
- `items` (array, required): `[{ productId, quantity, price }]`

**Response (200 OK):**
```json
{
  "valid": true,
  "coupon": { "code": "SUMMER10", "value": 10, "type": "percentage", ... },
  "discount": 15.50,
  "message": "Coupon applied!"
}
```

---

### Create Coupon (Admin)
`POST /coupons`

---

### Update Coupon (Admin)
`PATCH /coupons/:id`

---

### Delete Coupon (Admin)
`DELETE /coupons/:id`
