# PlayPen House API Documentation

Welcome to the PlayPen House API documentation. This API powers the PlayPen House storefront and admin dashboard.

## Base URL
All API requests should be made to:
`https://[your-domain]/api/v1`

## Authentication

The API uses two types of authentication:

1.  **Admin API Key**: Required for administrative (write) operations on resources like banners, categories, products, etc.
    -   **Header**: `Authorization: Bearer <ADMIN_API_KEY>`
2.  **JWT (JSON Web Token)**: Used for customer-specific operations.
    -   **Header**: `Authorization: Bearer <JWT_TOKEN>`
    -   Tokens are obtained via the `/auth/login` or `/auth/register` endpoints.

### Public Write Paths
The following paths allow write operations without an Admin API Key (usually protected by customer JWT or internal logic):
-   `/auth/`
-   `/orders`
-   `/reviews`
-   `/returns`
-   `/addresses`
-   `/users/`
-   `/coupons/validate`

## Standard Responses

### Success
-   `200 OK`: Request succeeded.
-   `201 Created`: Resource created successfully.
-   `204 No Content`: Request succeeded, no content returned (e.g., DELETE).

### Errors
-   `400 Bad Request`: Invalid request body or parameters.
-   `401 Unauthorized`: Missing or invalid authentication.
-   `404 Not Found`: Resource not found.
-   `422 Unprocessable Entity`: Validation error (prefix `VAL:` in message).
-   `429 Too Many Requests`: Rate limit exceeded.
-   `500 Internal Server Error`: Unexpected server error.

## Resource Endpoints

- [Authentication](auth.md)
- [Products](products.md)
- [Orders](orders.md)
- [Categories](categories.md)
- [Banners](banners.md)
- [Users](users.md)
- [Addresses](addresses.md)
- [Reviews](reviews.md)
- [Returns](returns.md)
- [Coupons](coupons.md)
- [Wallet](wallet.md)
- [Notifications](notifications.md)
- [Dashboard](dashboard.md)
- [Settings](settings.md)

## Specialized & External APIs

- [SEO Dynamic Routes](seo.md) - Middleware for social sharing and SEO.
- [External & Integrated APIs](external.md) - ImgBB and Google Email Webhook.
