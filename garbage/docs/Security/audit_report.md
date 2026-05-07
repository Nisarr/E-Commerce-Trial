# Security Audit Report — PlayPen House API

**Date**: 2026-05-05
**Scope**: Project API Routes and Entry Points

## Executive Summary
The PlayPen House API implements several security best practices, including centralized authentication for admin routes, password hashing, and basic rate limiting for authentication endpoints. However, there are areas for improvement, particularly in password hashing algorithms and global rate limiting.

---

## 1. Authentication & Session Management

### 1.1 Password Hashing
- **Observation**: `auth.ts` uses `SHA-256` with a hardcoded salt (`playpen-salt-2026`).
- **Risk**: Low to Medium. While better than plain text, SHA-256 is fast and vulnerable to brute-force if the salt is compromised.
- **Recommendation**: Transition to `bcrypt` or `argon2` with a minimum of 10-12 rounds. Use a worker-compatible library like `bcryptjs` or native `crypto` APIs for password derivation.

### 1.2 JWT Implementation
- **Observation**: JWT tokens are signed using `hono/jwt` with a 7-day expiration.
- **Risk**: Low. A fallback secret is provided in the code, which could be exploited if not overridden in production.
- **Recommendation**: Ensure `JWT_SECRET` is always set in the environment. Implement token revocation (blacklisting) if necessary.

---

## 2. Authorization

### 2.1 Administrative Access
- **Observation**: Sensitive write operations are protected by a global middleware checking for an `ADMIN_API_KEY`.
- **Risk**: Low. This is a robust way to isolate admin functionality.
- **Recommendation**: Rotate the `ADMIN_API_KEY` regularly.

### 2.2 IDOR (Insecure Direct Object Reference)
- **Observation**: Some customer-facing endpoints (like `PATCH /addresses/:id`) rely on `userId` in the body or query but don't always verify if the authenticated user owns that ID.
- **Risk**: Medium. Users might be able to modify resources belonging to others if they know the ID.
- **Recommendation**: Implement a middleware that verifies resource ownership based on the JWT `sub` claim.

---

## 3. Input Validation & Injection

### 3.1 SQL Injection
- **Observation**: The project uses **Drizzle ORM**, which inherently protects against SQL injection by using parameterized queries.
- **Risk**: Negligible.
- **Recommendation**: Continue using ORM methods for all database interactions. Avoid raw SQL queries where possible.

### 3.2 Schema Validation
- **Observation**: Validation is largely manual (e.g., `if (!body.title)`).
- **Risk**: Low. Manual validation can be inconsistent or incomplete.
- **Recommendation**: Implement **Zod** or **Yup** for strict schema validation across all endpoints.

---

## 4. Availability & Protection

### 4.1 Rate Limiting
- **Observation**: Rate limiting is only applied to `/auth` routes.
- **Risk**: Medium. Other endpoints (like `/products`) could be vulnerable to scraping or DoS attacks.
- **Recommendation**: Apply global rate limiting using `hono/rate-limit` or Cloudflare's built-in rate limiting features.

### 4.2 CORS Policy
- **Observation**: `cors()` is enabled for all origins (`*`).
- **Risk**: Low to Medium. Allows any website to make requests to the API.
- **Recommendation**: Restrict `origin` to the specific storefront and admin domains in production.

---

## 5. Error Handling & Disclosure

### 5.1 Sensitive Information Leakage
- **Observation**: The error handler hides stack traces in production.
- **Risk**: Negligible.
- **Recommendation**: Ensure no sensitive configuration values (like DB URLs) are returned in error messages.

---

## 6. Recommendations Summary

| Priority | Item | Description |
| :--- | :--- | :--- |
| **High** | Password Hashing | Upgrade to Bcrypt/Argon2. |
| **Medium** | Authorization | Implement ownership checks for customer resources. |
| **Medium** | Rate Limiting | Expand rate limiting to all public endpoints. |
| **Low** | CORS | Restrict allowed origins. |
| **Low** | Validation | Implement Zod for all request schemas. |
