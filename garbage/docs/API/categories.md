# Categories API

Endpoints for managing product categories.

## Endpoints

### List Categories
`GET /categories`

**Query Parameters:**
- `featured` (boolean, optional): Set to `true` to show only featured categories.
- `all` (boolean, optional): Set to `true` to show inactive categories (Admin only).

---

### Create Category (Admin)
`POST /categories`

---

### Update Category (Admin)
`PATCH /categories/:id`

---

### Delete Category (Admin)
`DELETE /categories/:id`
