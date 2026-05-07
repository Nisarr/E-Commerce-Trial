# Reviews API

Endpoints for product reviews and ratings.

## Endpoints

### List Reviews
`GET /reviews`

**Query Parameters:**
- `productId` (uuid, optional): Get reviews for a specific product (includes stats).
- `userId` (uuid, optional): Get reviews by a specific user.

---

### Submit Review
`POST /reviews`

**Request Body:**
- `productId` (uuid, required)
- `userId` (uuid, required)
- `rating` (number, 1-5, required)
- `username` (string, optional)
- `title` (string, optional)
- `content` (string, optional)
- `images` (array, optional)

---

### Update Review
`PATCH /reviews/:id`

---

### Delete Review
`DELETE /reviews/:id`
