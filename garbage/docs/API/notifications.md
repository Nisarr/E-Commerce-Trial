# Notifications API

Endpoints for user and broadcast notifications.

## Endpoints

### List Notifications
`GET /notifications`

**Query Parameters:**
- `userId` (uuid, optional): If omitted, returns broadcast notifications only.

---

### Create Notification (Admin/System)
`POST /notifications`

---

### Mark as Read
`POST /notifications/:id/read`
