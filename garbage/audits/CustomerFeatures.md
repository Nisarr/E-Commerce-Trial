# 🛒 PlayPen House — Customer Features Specification

> Complete feature specification for the customer-facing side of PlayPen House baby e-commerce platform.

---

## 📐 Account Dashboard Layout

The user account area uses a **sidebar + content** layout:

```
┌──────────────────────────────────────────────────────┐
│  [Logo]   Search...                  🛒 Cart  ❤ ♡   │
├────────────────┬─────────────────────────────────────┤
│                │                                     │
│  Hello, User   │    [ Page Content Area ]            │
│  ✅ Verified   │                                     │
│                │                                     │
│ ─────────────  │                                     │
│ Manage Account │                                     │
│   My Profile   │                                     │
│   Address Book │                                     │
│   Payments     │                                     │
│   Wallet       │                                     │
│                │                                     │
│ My Orders      │                                     │
│   My Returns   │                                     │
│   Cancellations│                                     │
│                │                                     │
│ My Reviews     │                                     │
│ My Wishlist    │                                     │
│                │                                     │
│ [Logout]       │                                     │
│                │                                     │
└────────────────┴─────────────────────────────────────┘
```

### Mobile Layout
- Sidebar collapses into a **horizontal scrollable tab bar** at the top
- Or a **hamburger drawer** sliding from left

---

## 🔐 1. Authentication & Registration

### 1.1 User Login (`/account/login`)
- **Fields**: Email, Password
- **Features**:
  - "Remember Me" checkbox
  - "Forgot Password" link
  - Social login buttons (future: Google, Facebook)
  - Link to registration page

### 1.2 User Registration (`/account/register`)
- **Fields**: Full Name, Email, Phone, Password, Confirm Password
- **Validation**:
  - Email format validation
  - Password strength indicator (min 8 chars, 1 uppercase, 1 number)
  - Phone format validation (BD: 01XXXXXXXXX)
  - Terms & Conditions checkbox (required)
- **Post-registration**: Auto-login → redirect to Account Dashboard

### 1.3 Password Recovery (Future)
- Email-based OTP or reset link
- Not in initial scope

---

## 👤 2. My Profile (`/account/profile`)

### 2.1 Profile Display
- Avatar (initials-based default, uploadable)
- Full Name
- Email (with verified/unverified badge)
- Phone
- Account creation date
- Verification status badge

### 2.2 Profile Edit
- Inline edit or modal form
- Editable: Full Name, Phone, Avatar
- Email change requires re-verification (future)

### 2.3 Change Password
- Separate section/modal
- Fields: Current Password, New Password, Confirm New Password

---

## 📍 3. Address Book (`/account/addresses`)

### 3.1 Address List
- Card-based grid layout
- Each card shows:
  - Label (Home, Office, Custom)
  - Full Name
  - Phone Number
  - Full Address + City + Postal Code
  - "Default" badge on primary address
  - Edit / Delete actions

### 3.2 Add/Edit Address Modal
- **Fields**:
  - Label (dropdown: Home, Office, Other)
  - Full Name
  - Phone Number
  - Address Line
  - City / Division
  - Postal Code
  - "Set as default" toggle

### 3.3 Checkout Integration
- During checkout, logged-in users see a **"Select Saved Address"** dropdown
- Option to add new address inline
- Default address auto-selected

---

## 🛒 4. Shopping Cart (`/cart`)

### 4.1 Current Features (Keep)
- Add/remove items
- Quantity +/- controls
- Product image, title, brand, price
- Subtotal, Shipping ($15 flat), Total
- Checkout form (name, email, phone, address)

### 4.2 New Enhancements
- **Persistence**: Cart survives page refresh (Zustand `persist` → localStorage)
- **Stock validation**: Check available stock before checkout
- **Saved address integration**: Pre-fill from Address Book
- **Coupon/Promo code** input field (future)
- **Estimated delivery date** display
- **Cart item count** in navbar badge (already working)
- **"Save for Later"** option per item → moves to Wishlist
- **Empty cart CTA**: "Continue Shopping" + product recommendations

### 4.3 Mini Cart (Navbar)
- Hover/click on cart icon shows a dropdown preview
- Shows top 3 items + total
- "View Cart" and "Checkout" buttons

---

## ❤️ 5. Wishlist (`/wishlist` or `/account/wishlist`)

### 5.1 Features
- **Product Grid**: Reuses `ProductCard` component
- **Persistence**: Survives refresh (Zustand `persist` → localStorage)
- **Actions per item**:
  - "Move to Cart" → adds to cart + removes from wishlist
  - "Remove" → removes from wishlist
  - Quick view (if QuickViewModal exists)
- **Bulk actions**:
  - "Move All to Cart"
  - "Clear Wishlist"
- **Empty state**: Illustration + "Browse Products" CTA

### 5.2 Wishlist Toggle
- Heart icon on every `ProductCard` (already exists)
- Filled heart = in wishlist, outline = not in wishlist
- Animated toggle (heart "pop" animation)

### 5.3 Navbar Badge
- Heart icon in navbar shows wishlist count badge (already implemented)

---

## 📦 6. Order Management

### 6.1 Order History (`/account/orders`)
- **List view** with:
  - Invoice ID
  - Order date
  - Total amount
  - Status badge (color-coded)
  - "View Details" button
- **Filters**: All, Pending, Processing, Shipped, Delivered, Cancelled
- **Search**: By Invoice ID
- **Pagination**: 10 orders per page

### 6.2 Order Detail (`/account/orders/:id`)
- Full order information card:
  - Invoice ID, Date, Status
  - Shipping address
  - Contact details
- **Items table**: Product image, name, qty, unit price, line total
- **Price breakdown**: Subtotal, Shipping, Discount (if any), Total
- **Tracking Timeline** (see below)
- **Actions** (conditional):
  - "Cancel Order" (if Pending/Processing)
  - "Request Return" (if Delivered, within 7 days)
  - "Download Invoice" (PDF generation)
  - "Re-order" → adds all items back to cart

### 6.3 Order Tracking Timeline
- Visual step-by-step tracker:
  ```
  ● Order Placed ─────── May 1, 2026, 10:30 AM
  │  "Your order has been placed successfully."
  │
  ● Processing ──────── May 2, 2026, 2:15 PM
  │  "Order is being prepared for shipment."
  │  📍 Warehouse, Dhaka
  │
  ◐ Shipped ──────────── May 3, 2026, 9:00 AM
  │  "Package has been handed to courier."
  │  📍 Courier Hub, Dhaka
  │
  ○ Out for Delivery ──── (pending)
  │
  ○ Delivered ─────────── (pending)
  ```
- **Colors**: Completed steps = accent green, Current = accent blue, Pending = gray
- **Icons**: Each step has a unique icon

### 6.4 Public Order Tracking (`/track-order`)
- Accessible without login
- Input: Invoice ID (e.g., INV-123456-ABCD)
- Shows: Order status + full tracking timeline
- Use case: Share tracking link with recipients

---

## 🔄 7. Returns & Cancellations

### 7.1 Cancel Order Flow
- **Trigger**: "Cancel Order" button on order detail
- **Conditions**: Order status must be `Pending` or `Processing`
- **Form**: Reason selection (dropdown):
  - Changed my mind
  - Found a better price
  - Ordered by mistake
  - Delivery too slow
  - Other (free text)
- **Result**: Order status → `Cancelled`

### 7.2 Return Order Flow
- **Trigger**: "Request Return" button on order detail
- **Conditions**: Order status must be `Delivered`, within 7 days
- **Form**:
  - Select items to return (checkboxes)
  - Reason (dropdown):
    - Damaged product
    - Wrong item received
    - Product not as described
    - Quality not satisfactory
    - Other (free text)
  - Upload images (optional evidence)
- **Result**: Return request created → Awaits admin approval

### 7.3 My Returns Page (`/account/returns`)
- List of return requests with:
  - Return ID
  - Order Invoice ID
  - Reason
  - Status badge (Requested → Approved → Completed / Rejected)
  - Date requested

### 7.4 My Cancellations Page (`/account/cancellations`)
- List of cancelled orders with:
  - Invoice ID
  - Original amount
  - Cancellation date
  - Refund status (if applicable)

---

## ⭐ 8. Reviews & Ratings

### 8.1 Submit Review
- **Where**: Product Detail page, below product info
- **Conditions**: Must be logged in, ideally after purchasing
- **Form**:
  - Star rating (1-5, interactive star selector)
  - Review title (optional)
  - Review text
  - Upload images (optional, max 3)
- **Badge**: "Verified Purchase ✅" if user bought this product

### 8.2 Review Display (Product Page)
- **Summary bar**: Average rating + star distribution (5★: ██████ 45%, etc.)
- **Review list** (paginated, newest first):
  - Username + avatar
  - Star rating
  - Review title + text
  - Review images (lightbox on click)
  - Date
  - "Verified Purchase" badge
  - Helpful? Yes/No buttons (future)
- **Filters**: By star rating, Verified only, With images

### 8.3 My Reviews Page (`/account/reviews`)
- All reviews submitted by the user
- Edit / Delete own reviews
- Shows product thumbnail + link

---

## 💳 9. Payment Options (`/account/payments`) — Future

### 9.1 Saved Payment Methods
- Card display (masked number, expiry, card brand icon)
- Add new card (modal)
- Remove card
- Set default payment method
- **Note**: Requires payment gateway integration (bKash, SSLCommerz, Nagad)

### 9.2 Supported Payment Methods (Planned)
| Method | Status |
|---|---|
| Cash on Delivery (COD) | ✅ Default |
| bKash | 🔜 Planned |
| Nagad | 🔜 Planned |
| SSLCommerz | 🔜 Planned |
| Credit/Debit Card | 🔜 Planned |

---

## 💰 10. Wallet (`/account/wallet`) — Future

### 10.1 Features
- **Balance display**: Current wallet balance
- **Transaction history**: Credits and debits with reference
- **Top-up**: Add funds via payment gateway
- **Use at checkout**: Option to pay with wallet balance
- **Refund credits**: Returns credited to wallet automatically

---

## 🔔 11. Additional Features

### 11.1 Recently Viewed Products
- Track last 10-20 viewed products
- Display as horizontal scroll section on homepage
- Stored in localStorage

### 11.2 Product Comparison (Future)
- Compare 2-4 products side by side
- Specs table comparison

### 11.3 Notifications (Future)
- Order status change notifications
- Price drop alerts for wishlist items
- Promotion notifications
- Bell icon in navbar with badge count

### 11.4 Customer Support Chat (Future)
- Live chat widget (bottom-right corner)
- Chatbot for common questions
- Escalation to human agent

---

## 🎨 Design System Notes

All customer features should follow the existing PlayPen House design system:

| Token | Value |
|---|---|
| **Font (Display)** | EB Garamond (`.font-garamond`) |
| **Font (Body)** | System / Inter |
| **Primary Color** | Dark navy/charcoal |
| **Accent Color** | Coral/Orange (`#FF4500`-ish) |
| **Border Radius** | `2xl` to `3xl` (rounded, playful) |
| **Shadows** | Soft, `shadow-xl shadow-primary/5` style |
| **Glass Effect** | `.glass` class for translucent backgrounds |
| **Animations** | Subtle scale + fade transitions |

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | Stacked, collapsible sidebar |
| Desktop | > 1024px | Sidebar + content, full nav |

---

## 📊 Data Models Summary

```
users ──────────────┐
  │                 │
  ├── addresses     │
  ├── reviews       │
  ├── returns       │
  └── wallet_txns   │
                    │
orders ─────────────┤
  ├── order_items   │
  └── trackings     │
                    │
products ───────────┘
  └── reviews
```

---

## ✅ Implementation Priority

| Priority | Features | Why |
|---|---|---|
| 🔴 P0 | Account Layout, Cart Persist, Wishlist Page | Core UX, minimal effort |
| 🔴 P0 | User Registration & Auth | Foundation for everything |
| 🟡 P1 | Order Tracking UI, Address Book | High customer value |
| 🟡 P1 | Returns & Cancellations | Trust & confidence |
| 🟢 P2 | Reviews System | Engagement & SEO |
| 🟢 P2 | Payment & Wallet | Revenue enabler |
| ⚪ P3 | Notifications, Chat, Comparison | Nice-to-have |
