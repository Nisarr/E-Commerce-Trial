# Orders API

Endpoints for placing, tracking, and managing orders.

## Endpoints

### List Orders (Admin)
`GET /orders`

**Query Parameters:**
- `customerName` (string, optional): Filter by customer name.

---

### Get Order Details
`GET /orders/:id`

Includes order items, product details, and tracking history.

**Response (200 OK):**
```json
{
  "id": "invoice-id",
  "customerName": "John Doe",
  "status": "Pending",
  "items": [
    { "productId": "...", "productName": "...", "quantity": 1, "price": 99.99 }
  ],
  "trackings": [...]
}
```

---

### Place Order
`POST /orders`

Creates a new order. Performs stock validation and updates sold counts.

**Request Body:**
- `customerName` (string, required)
- `shippingAddress` (string, required)
- `customerEmail` (string, optional)
- `customerPhone` (string, optional)
- `items` (array, required): `[{ productId, quantity, price }]`
- `paymentMethod` (string, optional): `cod`, `wallet`, etc.

**Response (201 Created):**
```json
{
  "id": "invoice-id",
  "invoiceId": "DDMMYYYY-XXX",
  "message": "Order placed successfully"
}
```

---

### Update Order Status (Admin)
`PATCH /orders/:id/status`

Updates the overall status of an order and notifies the customer.

---

### Add Tracking (Admin)
`POST /orders/:id/trackings`

Adds a new tracking entry (e.g., "Shipped", "Out for Delivery") and updates the order status.

---

### Cancel Order
`POST /orders/:id/cancel`

Allows a customer to cancel an order if it is in `Pending` or `Processing` status. Restores stock and decrements sold counts.

**Request Body:**
- `reason` (string, optional)
