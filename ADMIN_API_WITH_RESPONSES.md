# Admin API Documentation (With Example Responses)

**Base URL:** `http://localhost:5000/api/v1`
*(Once deployed, this will change to EC2 IP or domain)*

## Authentication
All admin routes (except login/register/forgot-password) require:
```
Header: Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

## Response Format (all endpoints)
```json
{
  "data": { ... },
  "message": "Success message",
  "toast": true,
  "responseType": "success"
}
```

**Error Response Example:**
```json
{
  "data": null,
  "message": "Invalid mobile or password",
  "toast": true,
  "responseType": "error"
}
```

---

## 1. AUTH

### 1.1 Admin Register
**POST** `/admin/register`

**Purpose:** Create a new admin account. Use for first admin setup.

**Request Body:**
```json
{
  "name": "Admin User",
  "mobile": 9876543210,
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Success Response (201):**
```json
{
  "data": {
    "admin": {
      "id": "66f8b4c9d1a2b3c4d5e6f7a1",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiNjZmOGI0YzlkMWEyYjNjNGQ1ZTZmN2ExIiwiaWF0IjoxNzExNDcyMDAwLCJleHAiOjE3MTE1NTg0MDB9.xxxxxxxx",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxx"
  },
  "message": "Admin registered successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 1.2 Admin Login
**POST** `/admin/login`

**Purpose:** Admin login. Use on login screen.

**Request Body:**
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

**Success Response (200):**
```json
{
  "data": {
    "admin": {
      "id": "66f8b4c9d1a2b3c4d5e6f7a1",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiNjZmOGI0YzlkMWEyYjNjNGQ1ZTZmN2ExIiwiaWF0IjoxNzExNDcyMDAwLCJleHAiOjE3MTE1NTg0MDB9.xxxxxxxx",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxx"
  },
  "message": "Admin logged in successfully",
  "toast": false,
  "responseType": "success"
}
```

**Error Response (400):**
```json
{
  "data": null,
  "message": "Invalid mobile or password",
  "toast": true,
  "responseType": "error"
}
```

---

### 1.3 Refresh Token
**POST** `/admin/refresh-token`

**Purpose:** Get new access token when it expires.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxx",
  "deviceId": "web-browser-001"
}
```

**Success Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newTokenHere"
  },
  "message": "Access token refreshed",
  "toast": false,
  "responseType": "success"
}
```

---

### 1.4 Logout
**POST** `/admin/logout`

**Purpose:** Logout and revoke current device token.

**Auth:** Required

**Request Body:**
```json
{
  "deviceId": "web-browser-001"
}
```

**Success Response:**
```json
{
  "data": null,
  "message": "Logged out successfully",
  "toast": false,
  "responseType": "success"
}
```

---

## 2. FORGOT PASSWORD (OTP)

### 2.1 Send OTP
**POST** `/admin/forgot-password/send-otp`

**Purpose:** Send OTP to admin's registered mobile. Use on "Forgot Password" screen.

**Request Body:**
```json
{
  "mobile": 9876543210
}
```

**Success Response:**
```json
{
  "data": {},
  "message": "OTP sent to your registered mobile",
  "toast": true,
  "responseType": "success"
}
```

**Error Response (Admin not found):**
```json
{
  "data": null,
  "message": "Admin not found",
  "toast": true,
  "responseType": "error"
}
```

---

### 2.2 Verify OTP
**POST** `/admin/forgot-password/verify-otp`

**Purpose:** Verify OTP. Returns a `resetToken` valid for 15 min.

**Request Body:**
```json
{
  "mobile": 9876543210,
  "otp": 123456
}
```

**Success Response:**
```json
{
  "data": {
    "resetToken": "3a7d8f4b2c9e1a0d5b6f8e7c4a2b1d9f"
  },
  "message": "OTP verified successfully",
  "toast": false,
  "responseType": "success"
}
```

**Error Response:**
```json
{
  "data": null,
  "message": "Invalid or expired OTP",
  "toast": true,
  "responseType": "error"
}
```

---

### 2.3 Reset Password
**POST** `/admin/forgot-password/reset`

**Purpose:** Reset password using the reset token from step 2.2.

**Request Body:**
```json
{
  "resetToken": "3a7d8f4b2c9e1a0d5b6f8e7c4a2b1d9f",
  "newPassword": "newpass123"
}
```

**Success Response:**
```json
{
  "data": {
    "reset": true
  },
  "message": "Password reset successfully",
  "toast": true,
  "responseType": "success"
}
```

---

## 3. ADMIN PROFILE

### 3.1 Get Profile
**GET** `/admin/profile`

**Purpose:** Get current logged-in admin's profile. Use on settings/profile page.

**Auth:** Required

**Success Response:**
```json
{
  "data": {
    "_id": "66f8b4c9d1a2b3c4d5e6f7a1",
    "name": "Admin User",
    "email": "admin@example.com",
    "mobile": 9876543210,
    "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/admin-profile.jpg",
    "isActive": true,
    "lastLoginAt": "2026-04-22T09:30:00.000Z",
    "createdAt": "2026-01-15T10:00:00.000Z"
  },
  "message": "Admin profile fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 3.2 Update Profile
**PUT** `/admin/profile`

**Purpose:** Update admin profile (name/email/image). Use on edit profile page.

**Auth:** Required

**Request Body (all fields optional):**
```json
{
  "name": "Admin New Name",
  "email": "newemail@example.com",
  "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/new-img.jpg"
}
```

**Success Response:**
```json
{
  "data": {
    "_id": "66f8b4c9d1a2b3c4d5e6f7a1",
    "name": "Admin New Name",
    "email": "newemail@example.com",
    "mobile": 9876543210,
    "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/new-img.jpg"
  },
  "message": "Admin profile updated successfully",
  "toast": true,
  "responseType": "success"
}
```

---

### 3.3 Change Password
**POST** `/admin/change-password`

**Purpose:** Change password when logged in. Use on settings page.

**Auth:** Required

**Request Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

**Success Response:**
```json
{
  "data": {
    "changed": true
  },
  "message": "Password changed successfully",
  "toast": true,
  "responseType": "success"
}
```

**Error Response (wrong current password):**
```json
{
  "data": null,
  "message": "Current password is incorrect",
  "toast": true,
  "responseType": "error"
}
```

---

## 4. KYC REVIEW

### 4.1 List KYC Submissions
**GET** `/admin/kyc/submitted?kycStatus=UNDER_REVIEW&page=1&pageSize=10`

**Purpose:** List users whose KYC documents need review. Use on "KYC Review" page.

**Query Params:**
- `kycStatus` (optional) - NOT_STARTED | IN_PROGRESS | UNDER_REVIEW | APPROVED | REJECTED
- `page` (default: 1)
- `pageSize` (default: 10, max: 100)

**Success Response:**
```json
{
  "data": {
    "count": 2,
    "data": [
      {
        "_id": "66f8b4c9d1a2b3c4d5e6f7b1",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "email": "vijay@example.com",
        "mobile": "9876543211",
        "kycStatus": "UNDER_REVIEW",
        "onboardingStep": 5,
        "createdAt": "2026-04-20T08:30:00.000Z",
        "documents": [
          {
            "_id": "66f8b4c9d1a2b3c4d5e6f7c1",
            "userId": "66f8b4c9d1a2b3c4d5e6f7b1",
            "type": "ADDRESS_PROOF",
            "documentName": "Aadhaar Card",
            "frontImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/aadhaar-front.jpg",
            "backImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/aadhaar-back.jpg",
            "status": "PENDING",
            "createdAt": "2026-04-20T08:35:00.000Z"
          },
          {
            "_id": "66f8b4c9d1a2b3c4d5e6f7c2",
            "userId": "66f8b4c9d1a2b3c4d5e6f7b1",
            "type": "EDUCATION_PROOF",
            "documentName": "Degree Certificate",
            "frontImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/degree.jpg",
            "backImage": null,
            "status": "PENDING",
            "createdAt": "2026-04-20T08:40:00.000Z"
          }
        ]
      },
      {
        "_id": "66f8b4c9d1a2b3c4d5e6f7b2",
        "firstName": "Anjali",
        "lastName": "Bharwad",
        "email": "anjali@example.com",
        "mobile": "9876543212",
        "kycStatus": "UNDER_REVIEW",
        "onboardingStep": 5,
        "createdAt": "2026-04-21T10:00:00.000Z",
        "documents": [
          {
            "_id": "66f8b4c9d1a2b3c4d5e6f7c3",
            "type": "ADDRESS_PROOF",
            "documentName": "Voter ID",
            "frontImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/voter-front.jpg",
            "backImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/voter-back.jpg",
            "status": "PENDING"
          }
        ]
      }
    ]
  },
  "message": "Submitted KYC users fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 4.2 Review Document
**POST** `/admin/reviewUserDocument`

**Purpose:** Approve or reject a user's KYC document.

**Auth:** Required

**Request Body (Approve):**
```json
{
  "userId": "66f8b4c9d1a2b3c4d5e6f7b1",
  "docId": "66f8b4c9d1a2b3c4d5e6f7c1",
  "action": "APPROVED"
}
```

**Request Body (Reject):**
```json
{
  "userId": "66f8b4c9d1a2b3c4d5e6f7b1",
  "docId": "66f8b4c9d1a2b3c4d5e6f7c1",
  "action": "REJECTED",
  "rejectionReason": "Document is blurry, please re-upload"
}
```

**Success Response (Approved):**
```json
{
  "data": {
    "_id": "66f8b4c9d1a2b3c4d5e6f7c1",
    "userId": "66f8b4c9d1a2b3c4d5e6f7b1",
    "type": "ADDRESS_PROOF",
    "documentName": "Aadhaar Card",
    "status": "APPROVED",
    "rejectionReason": null,
    "reviewedBy": "66f8b4c9d1a2b3c4d5e6f7a1",
    "reviewedAt": "2026-04-22T11:00:00.000Z"
  },
  "message": "Document approved",
  "toast": false,
  "responseType": "success"
}
```

**Success Response (Rejected):**
```json
{
  "data": {
    "_id": "66f8b4c9d1a2b3c4d5e6f7c1",
    "userId": "66f8b4c9d1a2b3c4d5e6f7b1",
    "type": "ADDRESS_PROOF",
    "documentName": "Aadhaar Card",
    "status": "REJECTED",
    "rejectionReason": "Document is blurry, please re-upload",
    "reviewedBy": "66f8b4c9d1a2b3c4d5e6f7a1",
    "reviewedAt": "2026-04-22T11:00:00.000Z"
  },
  "message": "Document rejected",
  "toast": false,
  "responseType": "success"
}
```

---

## 6. USER MANAGEMENT

### 6.1 List Users
**GET** `/admin/users?status=APPROVED&kycStatus=APPROVED&isBlocked=false&q=vijay&page=1&pageSize=20`

**Purpose:** List all users with filters + search. Use on "Users" page.

**Query Filters:**
- `status` (optional) - NEW | PENDING | APPROVED | REJECTED
- `kycStatus` (optional) - NOT_STARTED | IN_PROGRESS | UNDER_REVIEW | APPROVED | REJECTED
- `isBlocked` (optional) - true | false
- `isActive` (optional) - true | false
- `q` (optional) - search by firstName/lastName/email/mobile
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)

**Success Response:**
```json
{
  "data": {
    "users": [
      {
        "_id": "66f8b4c9d1a2b3c4d5e6f7b1",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "mobile": "9876543211",
        "email": "vijay@example.com",
        "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/vijay.jpg",
        "status": "APPROVED",
        "kycStatus": "APPROVED",
        "isBlocked": false,
        "isActive": true,
        "lastLoginAt": "2026-04-22T09:00:00.000Z",
        "createdAt": "2026-01-10T05:30:00.000Z"
      },
      {
        "_id": "66f8b4c9d1a2b3c4d5e6f7b2",
        "firstName": "Anjali",
        "lastName": "Bharwad",
        "mobile": "9876543212",
        "email": "anjali@example.com",
        "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/anjali.jpg",
        "status": "APPROVED",
        "kycStatus": "APPROVED",
        "isBlocked": false,
        "isActive": true,
        "lastLoginAt": "2026-04-21T14:20:00.000Z",
        "createdAt": "2026-02-05T08:15:00.000Z"
      },
      {
        "_id": "66f8b4c9d1a2b3c4d5e6f7b3",
        "firstName": "Ashok",
        "lastName": "Bharwad",
        "mobile": "9876543213",
        "email": "ashok@example.com",
        "profileImage": "",
        "status": "PENDING",
        "kycStatus": "IN_PROGRESS",
        "isBlocked": false,
        "isActive": true,
        "lastLoginAt": "2026-04-22T10:45:00.000Z",
        "createdAt": "2026-04-20T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "message": "Users fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 6.2 Get User Detail
**GET** `/admin/users/:userId`

**Purpose:** Get full user details.

**Example:** `/admin/users/66f8b4c9d1a2b3c4d5e6f7b1`

**Success Response:**
```json
{
  "data": {
    "_id": "66f8b4c9d1a2b3c4d5e6f7b1",
    "firstName": "Vijay",
    "lastName": "Yadav",
    "mobile": "9876543211",
    "email": "vijay@example.com",
    "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/vijay.jpg",
    "status": "APPROVED",
    "kycStatus": "APPROVED",
    "onboardingStep": 5,
    "language": "en",
    "address": {
      "addressLine1": "123 Street",
      "addressLine2": "Near Bus Stand",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "pincode": "380001",
      "country": "India"
    },
    "isBlocked": false,
    "isActive": true,
    "lastLoginAt": "2026-04-22T09:00:00.000Z",
    "createdAt": "2026-01-10T05:30:00.000Z",
    "updatedAt": "2026-04-22T09:00:00.000Z"
  },
  "message": "User fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 6.3 Get User Stats
**GET** `/admin/users/:userId/stats`

**Purpose:** Get user's activity stats (posts, followers, following).

**Success Response:**
```json
{
  "data": {
    "user": {
      "_id": "66f8b4c9d1a2b3c4d5e6f7b1",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "profileImage": "https://community-app-uploads.s3.ap-south-1.amazonaws.com/uploads/vijay.jpg"
    },
    "stats": {
      "postCount": 25,
      "followerCount": 120,
      "followingCount": 80
    }
  },
  "message": "User stats fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 6.4 Block User
**POST** `/admin/users/:userId/block`

**Purpose:** Block user — revokes all their tokens, disables FCM push, prevents login.

**Auth:** Required

**Request Body (optional):**
```json
{
  "reason": "Spam posts"
}
```

**Success Response:**
```json
{
  "data": {
    "blocked": true
  },
  "message": "User blocked successfully",
  "toast": true,
  "responseType": "success"
}
```

**Side Effects:**
- User's `isBlocked` = true
- All user tokens revoked (force logout from all devices)
- All device tokens deactivated (no more push)
- User can't login or access any API

---

### 6.5 Unblock User
**POST** `/admin/users/:userId/unblock`

**Purpose:** Unblock user. Tokens stay revoked — user must login again.

**Success Response:**
```json
{
  "data": {
    "unblocked": true
  },
  "message": "User unblocked successfully",
  "toast": true,
  "responseType": "success"
}
```

---

### 6.6 Delete User (Soft Delete)
**DELETE** `/admin/users/:userId`

**Purpose:** Permanently delete user. Anonymizes PII but keeps record for referential integrity.

**Success Response:**
```json
{
  "data": {
    "deleted": true
  },
  "message": "User deleted successfully",
  "toast": true,
  "responseType": "success"
}
```

**Side Effects:**
- firstName = "Deleted", lastName = "User"
- email = null, mobile = "deleted_..."
- profileImage = null
- isBlocked = true, isActive = false
- All tokens deleted, device tokens deactivated

---

## 11. DASHBOARD

### 11.1 Dashboard Stats
**GET** `/admin/dashboard/stats`

**Purpose:** Main dashboard overview. Use on admin home page.

**Auth:** Required

**Success Response:**
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
  },
  "message": "Dashboard stats fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

### 11.2 Growth Chart
**GET** `/admin/dashboard/growth?days=30`

**Purpose:** Signup trend over last N days. Use for line chart on dashboard.

**Auth:** Required

**Query:** `days` (1-365, default 30)

**Success Response:**
```json
{
  "data": {
    "days": 30,
    "data": [
      { "date": "2026-03-23", "count": 15 },
      { "date": "2026-03-24", "count": 20 },
      { "date": "2026-03-25", "count": 12 },
      { "date": "2026-03-26", "count": 18 },
      { "date": "2026-03-27", "count": 25 },
      { "date": "2026-03-28", "count": 30 },
      { "date": "2026-03-29", "count": 22 },
      { "date": "2026-03-30", "count": 28 },
      { "date": "2026-03-31", "count": 35 },
      { "date": "2026-04-01", "count": 40 },
      { "date": "2026-04-02", "count": 33 },
      { "date": "2026-04-03", "count": 27 },
      { "date": "2026-04-04", "count": 19 },
      { "date": "2026-04-05", "count": 21 },
      { "date": "2026-04-06", "count": 16 },
      { "date": "2026-04-07", "count": 24 },
      { "date": "2026-04-08", "count": 29 },
      { "date": "2026-04-09", "count": 31 },
      { "date": "2026-04-10", "count": 26 },
      { "date": "2026-04-11", "count": 23 },
      { "date": "2026-04-12", "count": 18 },
      { "date": "2026-04-13", "count": 22 },
      { "date": "2026-04-14", "count": 28 },
      { "date": "2026-04-15", "count": 34 },
      { "date": "2026-04-16", "count": 38 },
      { "date": "2026-04-17", "count": 29 },
      { "date": "2026-04-18", "count": 25 },
      { "date": "2026-04-19", "count": 21 },
      { "date": "2026-04-20", "count": 32 },
      { "date": "2026-04-21", "count": 27 },
      { "date": "2026-04-22", "count": 20 }
    ]
  },
  "message": "Growth stats fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

## Common Error Responses

### 401 - Unauthorized
```json
{
  "data": null,
  "message": "Token expired",
  "toast": true,
  "responseType": "error"
}
```

### 403 - Forbidden
```json
{
  "data": null,
  "message": "Admin account is disabled",
  "toast": true,
  "responseType": "error"
}
```

### 404 - Not Found
```json
{
  "data": null,
  "message": "User not found",
  "toast": true,
  "responseType": "error"
}
```

### 400 - Validation Error
```json
{
  "data": null,
  "message": "\"mobile\" is required",
  "toast": true,
  "responseType": "error"
}
```

### 500 - Server Error
```json
{
  "data": null,
  "message": "Internal server error",
  "toast": true,
  "responseType": "error"
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

---

## Important Notes for Frontend

1. **All admin APIs (except login/register/forgot-password)** need `Authorization: Bearer <adminToken>` header

2. **When admin blocks a user:** user is instantly logged out from all devices + can't login. Push to that user stops.

3. **Forgot Password flow:**
   - OTP valid for **5 minutes**
   - Reset token (returned after OTP verify) valid for **15 minutes**

4. **Token Expiry:**
   - Access token: 1 day
   - Refresh token: 7 days
   - Use `/admin/refresh-token` when you get 401 to get new access token

5. **Pagination:**
   - Default `page: 1`, `pageSize: 10` or `20`
   - Max `pageSize: 100`
   - Response always includes `pagination: { page, pageSize, total, totalPages }`

6. **Date format:** All dates are in ISO 8601 format: `2026-04-22T09:00:00.000Z`

7. **IDs:** All IDs are MongoDB ObjectIds (24 character hex strings): `66f8b4c9d1a2b3c4d5e6f7a1`

8. **Base URL will change:**
   - Local: `http://localhost:5000/api/v1`
   - Production: Will share later (probably `https://your-domain.com/api/v1` or EC2 IP)
