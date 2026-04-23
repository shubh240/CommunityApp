# Admin API Documentation

**Base URL:** `http://localhost:5000/api/v1`

## Authentication
All admin routes (except login/register/forgot-password) require:
```
Header: Authorization: Bearer <admin_access_token>
```

## Response Format (all endpoints)
```json
{
  "data": { ... },
  "message": "Success message",
  "toast": true/false,
  "responseType": "success" | "error"
}
```

---

## 1. AUTH

### 1.1 Admin Register
**POST** `/admin/register`

**Purpose:** Create a new admin account. Use for first admin setup.

**Body:**
```json
{
  "name": "Admin Name",
  "mobile": 9876543210,
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "data": {
    "admin": { "id": "...", "name": "Admin Name", "email": "admin@example.com" },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "Admin registered successfully"
}
```

---

### 1.2 Admin Login
**POST** `/admin/login`

**Purpose:** Admin login. Use on login screen.

**Body:**
```json
{
  "mobile": 9876543210,
  "password": "admin123",
  "deviceInfo": {
    "deviceId": "web-browser-001",
    "platform": "web"
  }
}
```

**Response:**
```json
{
  "data": {
    "admin": { "id": "...", "name": "Admin Name", "email": "..." },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "Admin logged in successfully"
}
```

---

### 1.3 Refresh Token
**POST** `/admin/refresh-token`

**Purpose:** Get new access token when it expires.

**Body:**
```json
{
  "refreshToken": "...",
  "deviceId": "web-browser-001"
}
```

**Response:** `{ accessToken: "new-token" }`

---

### 1.4 Logout
**POST** `/admin/logout`

**Purpose:** Logout and revoke current device token.

**Auth:** Required

**Body:** `{ "deviceId": "web-browser-001" }`

---

## 2. FORGOT PASSWORD (OTP)

### 2.1 Send OTP
**POST** `/admin/forgot-password/send-otp`

**Purpose:** Send OTP to admin's registered mobile. Use on "Forgot Password" screen.

**Body:** `{ "mobile": 9876543210 }`

**Response:** `{ "data": {}, "message": "OTP sent to your registered mobile" }`

---

### 2.2 Verify OTP
**POST** `/admin/forgot-password/verify-otp`

**Purpose:** Verify OTP. Returns a `resetToken` that's valid for 15 min to reset password.

**Body:** `{ "mobile": 9876543210, "otp": 123456 }`

**Response:** `{ "data": { "resetToken": "abc123..." }, "message": "OTP verified successfully" }`

---

### 2.3 Reset Password
**POST** `/admin/forgot-password/reset`

**Purpose:** Reset password using the reset token from step 2.2.

**Body:** `{ "resetToken": "abc123...", "newPassword": "newpass123" }`

**Response:** `{ "data": { "reset": true }, "message": "Password reset successfully" }`

---

## 3. ADMIN PROFILE

### 3.1 Get Profile
**GET** `/admin/profile`

**Purpose:** Get current logged-in admin's profile. Use on settings/profile page.

**Auth:** Required

**Response:**
```json
{
  "data": {
    "_id": "...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "mobile": 9876543210,
    "profileImage": "https://s3.../img.jpg",
    "isActive": true,
    "lastLoginAt": "2026-04-22T...",
    "createdAt": "..."
  }
}
```

---

### 3.2 Update Profile
**PUT** `/admin/profile`

**Purpose:** Update admin profile (name/email/image). Use on edit profile page.

**Auth:** Required

**Body (all optional):**
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "profileImage": "https://s3.../img.jpg"
}
```

---

### 3.3 Change Password
**POST** `/admin/change-password`

**Purpose:** Change password when logged in. Use on settings page.

**Auth:** Required

**Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

---

## 4. KYC REVIEW

### 4.1 List KYC Submissions
**GET** `/admin/kyc/submitted?kycStatus=UNDER_REVIEW&page=1&pageSize=10`

**Purpose:** List users whose KYC documents need review. Use on "KYC Review" page.

**Query:** `kycStatus` (NOT_STARTED|IN_PROGRESS|UNDER_REVIEW|APPROVED|REJECTED), `page`, `pageSize`

**Response:** `{ data: { count, data: [...users with documents] } }`

---

### 4.2 Review Document
**POST** `/admin/reviewUserDocument`

**Purpose:** Approve or reject a user's KYC document.

**Auth:** Required

**Body (Approve):**
```json
{
  "userId": "...",
  "docId": "...",
  "action": "APPROVED"
}
```

**Body (Reject):**
```json
{
  "userId": "...",
  "docId": "...",
  "action": "REJECTED",
  "rejectionReason": "Document is blurry, please re-upload"
}
```

---

## 5. MATRIMONIAL REVIEW

### 5.1 List Matrimonial Profiles
**GET** `/admin/matrimonial/profiles?status=UNDER_REVIEW&page=1&pageSize=10`

**Purpose:** List matrimonial profiles waiting for review.

**Query:** `status` (DRAFT|UNDER_REVIEW|APPROVED|REJECTED), `page`, `pageSize`

---

### 5.2 Get Matrimonial Profile Detail
**GET** `/admin/matrimonial/profiles/:profileId`

**Purpose:** View full matrimonial profile detail before approving/rejecting.

---

### 5.3 Review Matrimonial Profile
**POST** `/admin/matrimonial/review`

**Purpose:** Approve or reject matrimonial profile.

**Body (Approve):** `{ "profileId": "...", "action": "APPROVED" }`

**Body (Reject):** `{ "profileId": "...", "action": "REJECTED", "rejectionReason": "Photos are inappropriate" }`

---

## 6. USER MANAGEMENT

### 6.1 List Users
**GET** `/admin/users?status=APPROVED&kycStatus=APPROVED&isBlocked=false&q=vijay&page=1&pageSize=20`

**Purpose:** List all users with filters + search. Use on "Users" page.

**Query Filters:**
- `status` - NEW|PENDING|APPROVED|REJECTED
- `kycStatus` - NOT_STARTED|IN_PROGRESS|UNDER_REVIEW|APPROVED|REJECTED
- `isBlocked` - true|false
- `isActive` - true|false
- `q` - search by firstName/lastName/email/mobile
- `page`, `pageSize`

**Response:**
```json
{
  "data": {
    "users": [ { "_id", "firstName", "lastName", "mobile", "email", "profileImage", "kycStatus", "isBlocked", ... } ],
    "pagination": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 }
  }
}
```

---

### 6.2 Get User Detail
**GET** `/admin/users/:userId`

**Purpose:** Get full user details.

---

### 6.3 Get User Stats
**GET** `/admin/users/:userId/stats`

**Purpose:** Get user's activity stats (posts, followers, following).

**Response:**
```json
{
  "data": {
    "user": { "_id", "firstName", "lastName", "profileImage" },
    "stats": { "postCount": 25, "followerCount": 120, "followingCount": 80 }
  }
}
```

---

### 6.4 Block User
**POST** `/admin/users/:userId/block`

**Purpose:** Block user — revokes all their tokens, disables FCM push, prevents login.

**Body:** `{ "reason": "Spam posts" }` (optional)

**Side Effects:**
- User's `isBlocked` = true
- All `UserToken` records marked as `isRevoked: true` (force logout from all devices)
- All `UserDeviceToken` records marked `isActive: false` (no more push)
- User can't login or access any API

---

### 6.5 Unblock User
**POST** `/admin/users/:userId/unblock`

**Purpose:** Unblock user. Tokens stay revoked — user must login again.

---

### 6.6 Delete User (Soft Delete)
**DELETE** `/admin/users/:userId`

**Purpose:** Permanently delete user. Anonymizes PII but keeps record for referential integrity.

**Side Effects:**
- firstName = "Deleted", lastName = "User"
- email = null, mobile = "deleted_..."
- profileImage = null
- isBlocked = true, isActive = false
- All tokens deleted, device tokens deactivated

---

## 7. REPORTS MODERATION

### 7.1 List Reports
**GET** `/admin/reports?type=POST&status=PENDING&page=1&pageSize=20`

**Purpose:** List all user reports for review.

**Query:** `type` (POST|USER|COMMENT), `status` (PENDING|REVIEWED|DISMISSED), `page`, `pageSize`

**Response:**
```json
{
  "data": {
    "reports": [
      {
        "_id": "...",
        "reporterId": { "_id", "firstName", "lastName", "profileImage" },
        "reportedId": { "_id", "firstName", "lastName", "profileImage" },
        "type": "POST",
        "referenceId": "...",
        "reason": "Spam",
        "description": "Contains spam links",
        "status": "PENDING",
        "createdAt": "..."
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 7.2 Get Report Detail
**GET** `/admin/reports/:reportId`

**Purpose:** View report + the reported content (post/comment/user) in one response.

**Response includes:** Full report + populated `content` field with the reported item.

---

### 7.3 Take Action on Report
**POST** `/admin/reports/:reportId/action`

**Purpose:** Take action on a report.

**Body:**
```json
{
  "action": "DELETE_CONTENT",
  "note": "Inappropriate content"
}
```

**Actions:**
- `DISMISS` - Mark as dismissed (no action)
- `DELETE_CONTENT` - Soft-delete the reported post/comment
- `WARN_USER` - Send warning notification to reported user
- `BAN_USER` - Block the reported user (revoke tokens + disable FCM)

---

## 8. POSTS MODERATION

### 8.1 List All Posts
**GET** `/admin/posts?postType=IMAGE&visibility=PUBLIC&userId=...&q=caption&page=1&pageSize=20`

**Purpose:** Browse all posts as admin (not just feed).

**Query:** `postType`, `visibility`, `userId`, `q` (search in content), `page`, `pageSize`

---

### 8.2 Force Delete Post
**DELETE** `/admin/posts/:postId`

**Purpose:** Admin soft-deletes any post + its media.

---

## 9. STORIES MODERATION

### 9.1 List Active Stories
**GET** `/admin/stories?userId=...&page=1&pageSize=20`

**Purpose:** List all currently active (non-expired) stories.

---

### 9.2 Force Delete Story
**DELETE** `/admin/stories/:storyId`

**Purpose:** Admin deletes any story + clears its views.

---

## 10. GROUPS MODERATION

### 10.1 List All Groups
**GET** `/admin/groups?groupType=PUBLIC&q=bharwad&page=1&pageSize=20`

**Purpose:** List all group chats.

**Query:** `groupType` (PUBLIC|PRIVATE|PASSWORD), `q`, `page`, `pageSize`

---

### 10.2 Get Group Detail
**GET** `/admin/groups/:groupId`

**Purpose:** View group with all members, admins, moderators, banned users.

---

### 10.3 Force Delete Group
**DELETE** `/admin/groups/:groupId`

**Purpose:** Admin deletes a group (marks isActive=false).

---

## 11. DASHBOARD

### 11.1 Dashboard Stats
**GET** `/admin/dashboard/stats`

**Purpose:** Main dashboard overview. Use on admin home page.

**Response:**
```json
{
  "data": {
    "users": {
      "total": 1500,
      "active": 1200,
      "blocked": 50,
      "newToday": 20,
      "newThisWeek": 120,
      "newThisMonth": 450
    },
    "kyc": {
      "notStarted": 50,
      "underReview": 30,
      "approved": 1300,
      "rejected": 120
    },
    "content": {
      "totalPosts": 8500,
      "activeStories": 120,
      "totalGroups": 45
    },
    "matrimonial": {
      "totalProfiles": 850,
      "underReview": 40
    },
    "reports": {
      "pending": 12
    }
  }
}
```

---

### 11.2 Growth Chart
**GET** `/admin/dashboard/growth?days=30`

**Purpose:** Signup trend over last N days. Use for line chart on dashboard.

**Query:** `days` (1-365, default 30)

**Response:**
```json
{
  "data": {
    "days": 30,
    "data": [
      { "date": "2026-03-23", "count": 15 },
      { "date": "2026-03-24", "count": 20 },
      ...
    ]
  }
}
```

---

## 12. BROADCAST NOTIFICATIONS

### 12.1 Send Broadcast
**POST** `/admin/broadcast/notification`

**Purpose:** Send push notification to users. Use on "Send Notification" page.

**Body (All users):**
```json
{
  "title": "New Feature!",
  "message": "Check out our new matrimonial feature",
  "targetType": "ALL"
}
```

**Body (By KYC status):**
```json
{
  "title": "KYC Pending",
  "message": "Please complete your KYC",
  "targetType": "KYC_STATUS",
  "kycStatus": "IN_PROGRESS"
}
```

**Body (By City):**
```json
{
  "title": "Event in Ahmedabad",
  "message": "Join us this weekend",
  "targetType": "CITY",
  "city": "Ahmedabad"
}
```

**Body (Specific users):**
```json
{
  "title": "Special offer",
  "message": "For selected users",
  "targetType": "USER_IDS",
  "userIds": ["userId1", "userId2", "userId3"]
}
```

**Response:**
```json
{
  "data": {
    "sentCount": 150,
    "deviceCount": 280
  }
}
```

---

## Frontend Usage Summary (Where to call what)

| Screen | Endpoints |
|--------|-----------|
| **Login Page** | 1.2 Login, 2.1-2.3 Forgot Password flow |
| **Dashboard Home** | 11.1 Dashboard stats, 11.2 Growth chart |
| **Profile/Settings** | 3.1 Get profile, 3.2 Update profile, 3.3 Change password |
| **Users List** | 6.1 List users (with filters) |
| **User Detail Page** | 6.2 Get user, 6.3 Stats, 6.4/6.5 Block/Unblock, 6.6 Delete |
| **KYC Review** | 4.1 List KYC, 4.2 Review document |
| **Matrimonial Review** | 5.1 List, 5.2 View, 5.3 Review |
| **Reports Page** | 7.1 List, 7.2 Detail, 7.3 Take action |
| **Posts Moderation** | 8.1 List, 8.2 Delete |
| **Stories Moderation** | 9.1 List, 9.2 Delete |
| **Groups Moderation** | 10.1 List, 10.2 Detail, 10.3 Delete |
| **Broadcast Page** | 12.1 Send notification |

---

## Important Notes for Frontend

1. **All admin APIs (except login/register/forgot-password) need `Authorization: Bearer <adminToken>` header**
2. **When admin blocks a user:** user is instantly logged out from all devices + can't login. Push to that user stops.
3. **Reset token from forgot password OTP is valid for 15 minutes**. OTP itself is valid for 5 minutes.
4. **Dashboard stats should auto-refresh** every 30-60 sec for live data.
5. **Report action** will trigger automatic push notification to user if WARN_USER is chosen.
6. **Broadcast notification** goes instantly — no "schedule for later" feature yet.
