# Products API

Endpoints for browsing and managing products.

## Endpoints

### List Products
`GET /products`

Retrieves a paginated list of products with optional filters.

**Query Parameters:**
- `page` (number, default: 1): Page number.
- `limit` (number, default: 12): Items per page (max 100).
- `category` (uuid, optional): Filter by category ID.
- `tag` (string, optional): Filter by tag (e.g., "new-arrival").
- `q` (string, optional): Search by title or brand.
- `sort` (string, optional): One of `newest`, `price-low`, `price-high`, `best-selling`, `trending`.
- `hasOffer` (boolean, optional): Set to `true` to show only items on sale.

**Response (200 OK):**
```json
{
  "items": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 12,
    "totalPages": 9
  },
  "_links": { ... }
}
```

---

### Search Products (Autocomplete)
`GET /products/search`

Quick search for autocomplete suggestions.

**Query Parameters:**
- `q` (string, required): Search query.

**Response (200 OK):**
```json
{
  "items": [...],
  "query": "baby pen",
  "_links": { ... }
}
```

---

### Get Product Details
`GET /products/:id`

Retrieves detailed information about a single product.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Baby Playpen",
  "price": 99.99,
  "salePrice": 79.99,
  "stock": 50,
  "images": "[\"url1\", \"url2\"]",
  ...
}
```

---

### Get Product Buyers (Admin)
`GET /products/:id/buyers`

Lists all customers who purchased this product.

**Response (200 OK):**
```json
{
  "items": [...],
  "_links": { ... }
}
```

---

### Create Product (Admin)
`POST /products`

**Request Body:**
- `title` (string, required)
- `price` (number, required)
- `categoryId` (uuid, optional)
- `brand` (string, optional)
- `stock` (number, default: 0)
- `images` (array/string, optional)
- `tags` (array/string, optional)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "message": "Product created successfully"
}
```

---

### Update Product (Admin)
`PATCH /products/:id`

Updates product details. Partial updates are supported.

---

### Sync Tags (Admin/System)
`POST /products/sync-tags`

Automatically updates "best-selling" or "new-arrival" tags based on sales and creation date.

**Request Body:**
- `type` (string, required): `best-selling` or `new-arrival`.
- `limit` (number, default: 10): Number of products to tag.

---

### Delete Product (Admin)
`DELETE /products/:id`
