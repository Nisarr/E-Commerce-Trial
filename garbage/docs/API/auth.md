# Authentication API

Endpoints for user registration, login, email verification, and password management.

## Endpoints

### Register User
`POST /auth/register`

Creates a new user account. If an email is provided, an OTP is sent for verification.

**Request Body:**
- `username` (string, required): Unique username.
- `password` (string, required): User password.
- `email` (string, optional): User email.
- `phone` (string, optional): User phone number.
- `fullName` (string, optional): User's full name (defaults to username).

**Response (201 Created):**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "message": "Account created! Check your email for the verification code.",
  "_links": { ... }
}
```

---

### Login
`POST /auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
- `username` (string, required): Username or email.
- `password` (string, required): User password.

**Response (200 OK):**
```json
{
  "token": "jwt_token",
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "user",
  "isVerified": 1,
  "message": "Login successful"
}
```

---

### Verify OTP
`POST /auth/verify-otp`

Verifies a user's email using a 6-digit code.

**Request Body:**
- `userId` (string, required): User ID.
- `code` (string, required): 6-digit OTP code.

**Response (200 OK):**
```json
{
  "message": "Email verified successfully."
}
```

---

### Resend OTP
`POST /auth/resend-otp`

Resends a verification code to the user's email.

**Request Body:**
- `userId` (string, required): User ID.

**Response (200 OK):**
```json
{
  "message": "OTP sent successfully."
}
```

---

### Forgot Password
`POST /auth/forgot-password`

Sends a password reset code to the user's email.

**Request Body:**
- `email` (string, required): User email.

**Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a reset code has been sent."
}
```

---

### Reset Password
`POST /auth/reset-password`

Resets the user's password using a reset code.

**Request Body:**
- `email` (string, required): User email.
- `code` (string, required): Reset code.
- `newPassword` (string, required): New password.

**Response (200 OK):**
```json
{
  "message": "Password reset successfully. You can now log in."
}
```

## Security
- **Rate Limiting**: 10 requests per minute per IP/path.
- **Hashing**: SHA-256 with a project-specific salt.
- **Tokens**: JWT expires in 7 days.
