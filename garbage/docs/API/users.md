# Users API

Endpoints for user profile management (Admin).

## Endpoints

### List Users (Admin)
`GET /users`

**Query Parameters:**
- `search` (string, optional): Search by username.
- `page` / `limit`: Pagination parameters.

---

### Get User Details
`GET /users/:id`

---

### Update User
`PATCH /users/:id`

---

### Change Password
`PATCH /users/:id/password`

**Request Body:**
- `currentPassword` (string, required)
- `newPassword` (string, required)

---

### Block/Unblock User (Admin)
`PATCH /users/:id/block`

---

### Verify User (Admin)
`PATCH /users/:id/verify`
