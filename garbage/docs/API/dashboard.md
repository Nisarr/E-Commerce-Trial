# Dashboard API

Endpoints for retrieving administrative statistics and analytics.

## Endpoints

### Get Stats
`GET /dashboard/stats`

**Query Parameters:**
- `from` (number, optional): Start timestamp in epoch ms.
- `to` (number, optional): End timestamp in epoch ms.

**Response (200 OK):**
```json
{
  "counts": {
    "products": 150,
    "categories": 12,
    "users": 1000,
    "orders": 500,
    "reviews": 300,
    "totalSold": 2500
  },
  "revenue": 25000.00,
  "ordersByStatus": { "Pending": 5, "Delivered": 450, ... },
  "recentOrders": [...],
  "lowStockProducts": [...],
  "monthlyRevenue": [...]
}
```
---
### Test Email
`POST /settings/test-email`
Sends a test email to verify Gmail integration.
**Request Body:**
- `email` (string, required)
