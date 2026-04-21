# Community App Backend - API Documentation

**Base URL:** `http://localhost:5000/api/v1`

## Authentication
All protected routes require:
```
Header: Authorization: Bearer <access_token>
```

## Response Format
All responses follow this structure:
```json
{
  "data": {},
  "message": "Success message",
  "toast": false,
  "responseType": "success"
}
```

## Error Response
```json
{
  "data": null,
  "message": "Error description",
  "toast": false,
  "responseType": "error"
}
```
Common status codes: `400` Bad Request | `401` Unauthorized | `403` Forbidden | `404` Not Found | `500` Server Error

---

## 1. AUTH MODULE (`/user/auth`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/user/auth/sendOtp` | No | Send OTP to mobile number for login/signup |
| 2 | POST | `/user/auth/verifyOtp` | No | Verify OTP and get access + refresh tokens |
| 3 | POST | `/user/auth/refresh-token` | No | Get new access token using refresh token |
| 4 | POST | `/user/auth/logout` | Yes | Logout and revoke token |

### 1.1 Send OTP
**Request:**
```json
POST /user/auth/sendOtp
Body:
{
  "mobile": "9876543210"
}
```
**Response: 200**
```json
{
  "data": {},
  "message": "OTP sent successfully",
  "toast": true,
  "responseType": "success"
}
```

### 1.2 Verify OTP
**Request:**
```json
POST /user/auth/verifyOtp
Body:
{
  "mobile": "9876543210",
  "otp": "1234",
  "deviceInfo": {
    "deviceId": "device-123",
    "platform": "android",
    "appVersion": "1.0.0"
  }
}
```
**Response: 200**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "69c2b2a1463ed663dd29037c",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "mobile": 9876543210,
      "email": "vijay@email.com",
      "profileImage": "https://s3.../photo.jpg",
      "onboardingStep": 1,
      "kycStatus": "NOT_STARTED"
    },
    "navigation": {
      "screen": "PERSONAL_INFO"
    }
  },
  "message": "OTP verified successfully",
  "toast": true,
  "responseType": "success"
}
```
> **Navigation screens:** `PERSONAL_INFO` | `ADDRESS_PROOF` | `EDUCATION_PROOF` | `OTHER_DOC` | `UNDER_REVIEW` | `REJECTED` | `HOME`

> When `screen: "REJECTED"`, response includes `rejectedDocs`:
```json
"navigation": {
  "screen": "REJECTED",
  "rejectedDocs": [
    {
      "type": "ADDRESS_PROOF",
      "documentName": "Aadhaar Card",
      "status": "REJECTED",
      "rejectionReason": "Document is blurry"
    }
  ]
}
```

### 1.3 Refresh Token
**Request:**
```json
POST /user/auth/refresh-token
Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "deviceId": "device-123"
}
```
**Response: 200**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Access token refreshed",
  "toast": false,
  "responseType": "success"
}
```

### 1.4 Logout
**Request:**
```json
POST /user/auth/logout
Header: Authorization: Bearer <token>
Body:
{
  "deviceId": "device-123"
}
```
**Response: 200**
```json
{
  "data": null,
  "message": "Logged out successfully",
  "toast": false,
  "responseType": "success"
}
```

---

## 2. USER MODULE (`/user/auth`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/user/auth/me` | Yes | Get current user profile + navigation screen |
| 2 | POST | `/user/auth/completeProfile` | Yes | Complete personal info (Step 1 of onboarding) |
| 3 | POST | `/user/auth/upload-documents` | Yes | Upload KYC documents (Step 2-4) |
| 4 | POST | `/user/auth/reUpload-documents` | Yes | Re-upload rejected documents |

### 2.1 Get Me
**Request:**
```json
GET /user/auth/me
Header: Authorization: Bearer <token>
```
**Response: 200**
```json
{
  "data": {
    "user": {
      "_id": "69c2b2a1463ed663dd29037c",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "mobile": 9876543210,
      "email": "vijay@email.com",
      "profileImage": "https://s3.../photo.jpg",
      "onboardingStep": 5,
      "kycStatus": "APPROVED",
      "isBlocked": false
    },
    "navigation": {
      "screen": "HOME"
    }
  },
  "message": "User profile fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 2.2 Complete Profile
**Request:**
```json
POST /user/auth/completeProfile
Header: Authorization: Bearer <token>
Body:
{
  "firstName": "Vijay",
  "lastName": "Yadav",
  "email": "vijay@email.com",
  "language": "en"
}
```
**Response: 200**
```json
{
  "data": {
    "onboardingStep": 2,
    "kycStatus": "IN_PROGRESS"
  },
  "message": "User profile successfully updated",
  "toast": false,
  "responseType": "success"
}
```

### 2.3 Upload Documents
**Request:**
```json
POST /user/auth/upload-documents
Header: Authorization: Bearer <token>
Body:
{
  "type": "ADDRESS_PROOF",       // ADDRESS_PROOF | EDUCATION_PROOF | OTHER
  "documentName": "Aadhaar Card",
  "frontImage": "https://s3.../front.jpg",
  "backImage": "https://s3.../back.jpg"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "69c2b2a1463ed663dd29037c",
    "firstName": "Vijay",
    "lastName": "Yadav",
    "mobile": 9876543210,
    "email": "vijay@email.com",
    "onboardingStep": 3,
    "kycStatus": "IN_PROGRESS"
  },
  "message": "Address proof uploaded successfully",
  "toast": false,
  "responseType": "success"
}
```
> **Note:** `onboardingStep` increments per doc: ADDRESS_PROOF=3, EDUCATION_PROOF=4, OTHER=5. After last doc, `kycStatus` becomes `UNDER_REVIEW`.

### 2.4 Re-Upload Documents (after rejection)
**Request:**
```json
POST /user/auth/reUpload-documents
Header: Authorization: Bearer <token>
Body:
{
  "type": "ADDRESS_PROOF",
  "documentName": "Aadhaar Card",
  "frontImage": "https://s3.../front-new.jpg",
  "backImage": "https://s3.../back-new.jpg"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "69c2b2a1463ed663dd29037c",
    "firstName": "Vijay",
    "lastName": "Yadav",
    "onboardingStep": 5,
    "kycStatus": "UNDER_REVIEW"
  },
  "message": "Address proof uploaded successfully",
  "toast": false,
  "responseType": "success"
}
```
> **Note:** `kycStatus` changes to `UNDER_REVIEW` only after ALL rejected docs are re-uploaded. If other docs are still `REJECTED`, status stays `REJECTED`.

---

## 3. ADMIN MODULE (`/admin`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/admin/register` | No | Register a new admin |
| 2 | POST | `/admin/login` | No | Admin login with mobile + password |
| 3 | POST | `/admin/refresh-token` | No | Get new access token using refresh token |
| 4 | POST | `/admin/logout` | Admin | Logout and revoke token |
| 5 | GET | `/admin/kyc/submitted` | Admin | List users pending KYC review |
| 6 | POST | `/admin/reviewUserDocument` | Admin | Approve/Reject user KYC document |
| 7 | GET | `/admin/matrimonial/profiles` | Admin | List matrimonial profiles for review |
| 8 | POST | `/admin/matrimonial/review` | Admin | Approve/Reject matrimonial profile |

### 3.1 Admin Register
**Request:**
```json
POST /admin/register
Body:
{
  "name": "Admin Name",
  "mobile": 9876543210,
  "email": "admin@example.com",
  "password": "admin123"
}
```
**Response: 201**
```json
{
  "data": {
    "admin": {
      "id": "69c2b2a1463ed663dd29037c",
      "name": "Admin Name",
      "email": "admin@example.com",
      "mobile": 9876543210
    }
  },
  "message": "Admin registered successfully",
  "toast": false,
  "responseType": "success"
}
```

### 3.2 Admin Login
**Request:**
```json
POST /admin/login
Body:
{
  "mobile": 9876543210,
  "password": "admin123",
  "deviceInfo": {
    "deviceId": "device-123",
    "platform": "web",
    "appVersion": "1.0.0"
  }
}
```
**Response: 200**
```json
{
  "data": {
    "admin": {
      "id": "69c2b2a1463ed663dd29037c",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Admin logged in successfully",
  "toast": false,
  "responseType": "success"
}
```

### 3.3 Admin Refresh Token
**Request:**
```json
POST /admin/refresh-token
Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "deviceId": "device-123"
}
```
**Response: 200**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Access token refreshed",
  "toast": false,
  "responseType": "success"
}
```

### 3.4 Admin Logout
**Request:**
```json
POST /admin/logout
Header: Authorization: Bearer <admin_token>
Body:
{
  "deviceId": "device-123"
}
```
**Response: 200**
```json
{
  "data": null,
  "message": "Logged out successfully",
  "toast": false,
  "responseType": "success"
}
```

### 3.5 List KYC Users
**Request:**
```json
GET /admin/kyc/submitted?kycStatus=UNDER_REVIEW&page=1&pageSize=10
Header: Authorization: Bearer <admin_token>
```
**Response: 200**
```json
{
  "data": {
    "count": 25,
    "data": [
      {
        "_id": "69c2b2a1463ed663dd29037c",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "email": "vijay@email.com",
        "mobile": 9876543210,
        "kycStatus": "UNDER_REVIEW",
        "onboardingStep": 5,
        "createdAt": "2026-03-24T15:53:53.420Z",
        "documents": [
          {
            "_id": "69c2b391c952e0a4b5474536",
            "userId": "69c2b2a1463ed663dd29037c",
            "type": "ADDRESS_PROOF",
            "documentName": "Aadhaar Card",
            "frontImage": "https://s3.../front.jpg",
            "backImage": "https://s3.../back.jpg",
            "status": "PENDING",
            "rejectionReason": null,
            "reviewedBy": null,
            "reviewedAt": null,
            "isActive": true
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
> **kycStatus filters:** `UNDER_REVIEW` | `APPROVED` | `REJECTED` | `IN_PROGRESS` | `NOT_STARTED` (or omit for all)

### 3.6 Review User Document
**Request (Approve):**
```json
POST /admin/reviewUserDocument
Header: Authorization: Bearer <admin_token>
Body:
{
  "userId": "69c2b2a1463ed663dd29037c",
  "docId": "69c2b391c952e0a4b5474536",
  "action": "APPROVED"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "69c2b391c952e0a4b5474536",
    "userId": "69c2b2a1463ed663dd29037c",
    "type": "ADDRESS_PROOF",
    "documentName": "Aadhaar Card",
    "status": "APPROVED",
    "rejectionReason": null,
    "reviewedBy": "admin_object_id",
    "reviewedAt": "2026-03-28T12:00:00.000Z",
    "isActive": true
  },
  "message": "Document approved",
  "toast": false,
  "responseType": "success"
}
```

**Request (Reject):**
```json
{
  "userId": "69c2b2a1463ed663dd29037c",
  "docId": "69c2b391c952e0a4b5474536",
  "action": "REJECTED",
  "rejectionReason": "Document is blurry, please re-upload"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "69c2b391c952e0a4b5474536",
    "status": "REJECTED",
    "rejectionReason": "Document is blurry, please re-upload",
    "reviewedBy": "admin_object_id",
    "reviewedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Document rejected",
  "toast": false,
  "responseType": "success"
}
```
> **Note:** When all 3 required docs (ADDRESS_PROOF, EDUCATION_PROOF, OTHER) are approved, user's `kycStatus` auto-changes to `APPROVED`.

### 3.7 List Matrimonial Profiles
**Request:**
```json
GET /admin/matrimonial/profiles?status=UNDER_REVIEW&page=1&pageSize=10
Header: Authorization: Bearer <admin_token>
```
**Response: 200**
```json
{
  "data": {
    "count": 5,
    "data": [
      {
        "_id": "profile_object_id",
        "userId": {
          "_id": "user_object_id",
          "firstName": "Vijay",
          "lastName": "Yadav",
          "mobile": 9876543210,
          "email": "vijay@email.com",
          "profileImage": "https://s3.../photo.jpg"
        },
        "createdForUserId": {
          "_id": "family_member_id",
          "firstName": "Ashok",
          "lastName": "Bharwad",
          "relation": "BROTHER"
        },
        "firstName": "Ashok",
        "lastName": "Bharwad",
        "status": "UNDER_REVIEW",
        "createdAt": "2026-03-26T10:00:00.000Z"
      }
    ]
  },
  "message": "Matrimonial profiles fetched",
  "toast": false,
  "responseType": "success"
}
```

### 3.8 Review Matrimonial Profile
**Request:**
```json
POST /admin/matrimonial/review
Header: Authorization: Bearer <admin_token>
Body:
{
  "profileId": "profile_object_id",
  "action": "APPROVED"
}
// If REJECTED:
{
  "profileId": "profile_object_id",
  "action": "REJECTED",
  "rejectionReason": "Incomplete profile information"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "profile_object_id",
    "status": "APPROVED",
    "reviewedBy": "admin_object_id",
    "reviewedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Profile approved",
  "toast": false,
  "responseType": "success"
}
```

---

## 4. SOCIAL MEDIA MODULE (`/social`)

### 4A. Posts

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts` | Yes | Create a new post (text/image/video) |
| 2 | PUT | `/social/posts/:postId` | Yes | Update post (content, media add/remove) |
| 3 | DELETE | `/social/posts/:postId` | Yes | Delete post |
| 4 | GET | `/social/posts/feed` | Yes | Get home feed (paginated) |
| 5 | GET | `/social/posts/saved` | Yes | Get saved posts |
| 6 | GET | `/social/posts/user/:userId` | Yes | Get posts by a specific user |
| 7 | GET | `/social/posts/:postId` | Yes | Get single post detail |
| 8 | POST | `/social/posts/:postId/share` | Yes | Share post (increment count) |

#### 4A.1 Create Post
**Request:**
```json
POST /social/posts
Header: Authorization: Bearer <token>
Body:
{
  "content": "Beautiful day at the beach!",
  "postType": "IMAGE",           // TEXT | IMAGE | VIDEO
  "visibility": "PUBLIC",        // PUBLIC | FRIENDS | PRIVATE
  "feeling": "happy",
  "checkin": {
    "location": "Goa Beach",
    "latitude": 15.2993,
    "longitude": 74.1240
  },
  "taggedUsers": ["user_id_1", "user_id_2"],
  "media": [
    {
      "mediaType": "IMAGE",
      "mediaUrl": "https://s3.../beach.jpg",
      "thumbnailUrl": "",
      "size": 204800
    }
  ]
}
```
**Response: 201**
```json
{
  "data": {
    "_id": "post_object_id",
    "userId": "user_object_id",
    "content": "Beautiful day at the beach!",
    "postType": "IMAGE",
    "visibility": "PUBLIC",
    "likeCount": 0,
    "commentCount": 0,
    "shareCount": 0,
    "createdAt": "2026-03-28T10:00:00.000Z",
    "media": [
      {
        "_id": "media_object_id",
        "postId": "post_object_id",
        "mediaType": "IMAGE",
        "mediaUrl": "https://s3.../beach.jpg",
        "thumbnailUrl": "",
        "size": 204800
      }
    ]
  },
  "message": "Post created successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4A.2 Update Post
**Request:**
```json
PUT /social/posts/:postId
Header: Authorization: Bearer <token>
Body:
{
  "content": "Updated caption!",
  "feeling": "excited",
  "addMedia": [
    {
      "mediaType": "IMAGE",
      "mediaUrl": "https://s3.../new-photo.jpg",
      "size": 102400
    }
  ],
  "removeMediaIds": ["media_object_id_to_remove"]
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "post_object_id",
    "userId": "user_object_id",
    "content": "Updated caption!",
    "postType": "IMAGE",
    "visibility": "PUBLIC",
    "media": [...]
  },
  "message": "Post updated successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4A.3 Delete Post
**Response: 200**
```json
{
  "data": {
    "postId": "post_object_id"
  },
  "message": "Post deleted successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4A.4 Get Feed
**Request:**
```json
GET /social/posts/feed?page=1&pageSize=10
GET /social/posts/feed?page=1&pageSize=10&postType=VIDEO
Header: Authorization: Bearer <token>
```
**Response: 200**
```json
{
  "data": {
    "posts": [
      {
        "_id": "post_object_id",
        "userId": {
          "_id": "user_object_id",
          "firstName": "Vijay",
          "lastName": "Yadav",
          "profileImage": "https://s3.../photo.jpg"
        },
        "content": "Beautiful day at the beach!",
        "postType": "IMAGE",
        "visibility": "PUBLIC",
        "likeCount": 15,
        "commentCount": 3,
        "shareCount": 2,
        "isLiked": true,
        "isSaved": false,
        "media": [...],
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "message": "Feed fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4A.5 Get Saved Posts
**Response:** Same structure as feed

#### 4A.6 Get User Posts
**Response:** Same structure as feed

#### 4A.7 Get Single Post
**Response: 200**
```json
{
  "data": {
    "_id": "post_object_id",
    "userId": {
      "_id": "user_object_id",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "profileImage": "https://s3.../photo.jpg"
    },
    "content": "Beautiful day!",
    "postType": "IMAGE",
    "isLiked": true,
    "isSaved": false,
    "media": [...],
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Post fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4A.8 Share Post
**Response: 200**
```json
{
  "data": {
    "_id": "post_object_id",
    "shareCount": 3
  },
  "message": "Post shared successfully",
  "toast": true,
  "responseType": "success"
}
```

### 4B. Likes

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts/:postId/like` | Yes | Toggle like/unlike |
| 2 | GET | `/social/posts/:postId/likes` | Yes | Get list of users who liked |

#### 4B.1 Toggle Like
**Response: 200**
```json
{
  "data": {
    "liked": true,
    "likeCount": 16
  },
  "message": "Post liked successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4B.2 Get Likes
**Response: 200**
```json
{
  "data": {
    "likes": [
      {
        "_id": "like_object_id",
        "userId": {
          "_id": "user_object_id",
          "firstName": "Ashok",
          "lastName": "Bharwad",
          "profileImage": "https://s3.../photo.jpg"
        },
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 16,
      "totalPages": 2
    }
  },
  "message": "Likes fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 4C. Comments

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts/:postId/comments` | Yes | Add comment (or reply) |
| 2 | GET | `/social/posts/:postId/comments` | Yes | Get comments with replies |
| 3 | PUT | `/social/posts/:postId/comments/:commentId` | Yes | Edit comment |
| 4 | DELETE | `/social/posts/:postId/comments/:commentId` | Yes | Delete comment |
| 5 | POST | `/social/posts/:postId/comments/:commentId/like` | Yes | Toggle comment like |

#### 4C.1 Add Comment
**Request:**
```json
POST /social/posts/:postId/comments
Header: Authorization: Bearer <token>
Body:
{
  "text": "Nice post!"
}
// Reply to a comment:
{
  "text": "Thanks!",
  "parentCommentId": "comment_object_id"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "comment_object_id",
    "postId": "post_object_id",
    "userId": "user_object_id",
    "content": "Nice post!",
    "likeCount": 0,
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Comment added successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4C.2 Get Comments
**Response: 200**
```json
{
  "data": {
    "comments": [
      {
        "_id": "comment_object_id",
        "postId": "post_object_id",
        "userId": {
          "_id": "user_object_id",
          "firstName": "Ashok",
          "lastName": "Bharwad",
          "profileImage": "https://s3.../photo.jpg"
        },
        "content": "Nice post!",
        "likeCount": 2,
        "isLiked": false,
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 3,
      "totalPages": 1
    }
  },
  "message": "Comments fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4C.3 Edit Comment
**Response: 200**
```json
{
  "data": {
    "_id": "comment_object_id",
    "content": "Updated comment!",
    "updatedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Comment updated successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4C.4 Delete Comment
**Response: 200**
```json
{
  "data": {
    "commentId": "comment_object_id"
  },
  "message": "Comment deleted successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4C.5 Toggle Comment Like
**Response: 200**
```json
{
  "data": {
    "liked": true,
    "likeCount": 3
  },
  "message": "Comment liked successfully",
  "toast": true,
  "responseType": "success"
}
```

### 4D. Save

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts/:postId/save` | Yes | Toggle save/unsave post |

**Response: 200**
```json
{
  "data": {
    "saved": true
  },
  "message": "Post saved successfully",
  "toast": true,
  "responseType": "success"
}
```

### 4E. Stories

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/stories` | Yes | Create story (24hr expiry) |
| 2 | GET | `/social/stories/feed` | Yes | Get stories feed (grouped by user) |
| 3 | POST | `/social/stories/:storyId/view` | Yes | Mark story as viewed |
| 4 | GET | `/social/stories/:storyId/views` | Yes | Get who viewed your story |
| 5 | DELETE | `/social/stories/:storyId` | Yes | Delete story |

#### 4E.1 Create Story
**Request:**
```json
POST /social/stories
Header: Authorization: Bearer <token>
Body:
{
  "mediaType": "IMAGE",          // IMAGE | VIDEO
  "mediaUrl": "https://s3.../story.jpg",
  "thumbnailUrl": ""
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "story_object_id",
    "userId": "user_object_id",
    "media": {
      "mediaType": "IMAGE",
      "mediaUrl": "https://s3.../story.jpg",
      "thumbnailUrl": ""
    },
    "expiresAt": "2026-03-29T10:00:00.000Z",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Story created successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4E.2 Get Stories Feed
**Response: 200**
```json
{
  "data": {
    "stories": [
      {
        "userId": {
          "_id": "user_object_id",
          "firstName": "Vijay",
          "lastName": "Yadav",
          "profileImage": "https://s3.../photo.jpg"
        },
        "stories": [
          {
            "_id": "story_object_id",
            "media": {
              "mediaType": "IMAGE",
              "mediaUrl": "https://s3.../story.jpg"
            },
            "viewCount": 5,
            "createdAt": "2026-03-28T10:00:00.000Z"
          }
        ]
      }
    ]
  },
  "message": "Stories fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4E.3 View Story
**Response: 200**
```json
{
  "data": {
    "viewed": true,
    "viewCount": 6
  },
  "message": "Story viewed successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4E.4 Get Story Views
**Response: 200**
```json
{
  "data": {
    "views": [
      {
        "_id": "view_object_id",
        "userId": {
          "_id": "user_object_id",
          "firstName": "Ashok",
          "lastName": "Bharwad",
          "profileImage": "https://s3.../photo.jpg"
        },
        "viewedAt": "2026-03-28T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 6,
      "totalPages": 1
    }
  },
  "message": "Story views fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4E.5 Delete Story
**Response: 200**
```json
{
  "data": {
    "storyId": "story_object_id"
  },
  "message": "Story deleted successfully",
  "toast": false,
  "responseType": "success"
}
```

### 4F. Follow

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/follow/:userId` | Yes | Send follow request |
| 2 | POST | `/social/follow/respond` | Yes | Accept/Reject follow request |
| 3 | DELETE | `/social/follow/:userId` | Yes | Unfollow user |
| 4 | GET | `/social/followers/:userId` | Yes | Get followers list |
| 5 | GET | `/social/following/:userId` | Yes | Get following list |
| 6 | GET | `/social/follow/requests` | Yes | Get pending follow requests |
| 7 | DELETE | `/social/follower/:userId` | Yes | Remove a follower |

#### 4F.1 Send Follow Request
**Response: 200**
```json
{
  "data": {
    "status": "PENDING",
    "requestId": "follow_object_id"
  },
  "message": "Follow request sent successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4F.2 Respond to Follow Request
**Request:**
```json
POST /social/follow/respond
Header: Authorization: Bearer <token>
Body:
{
  "requestId": "follow_object_id",
  "action": "ACCEPTED"           // ACCEPTED | REJECTED
}
```
**Response: 200**
```json
{
  "data": {
    "status": "ACCEPTED",
    "followId": "follow_object_id"
  },
  "message": "Follow request accepted",
  "toast": true,
  "responseType": "success"
}
```

#### 4F.3 Unfollow
**Response: 200**
```json
{
  "data": {
    "unfollowed": true
  },
  "message": "Unfollowed successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4F.4 Get Followers
**Response: 200**
```json
{
  "data": {
    "followers": [
      {
        "_id": "user_object_id",
        "firstName": "Ashok",
        "lastName": "Bharwad",
        "profileImage": "https://s3.../photo.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "message": "Followers fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4F.5 Get Following
**Response:** Same structure as followers

#### 4F.6 Get Follow Requests
**Response: 200**
```json
{
  "data": {
    "requests": [
      {
        "_id": "follow_object_id",
        "requesterId": {
          "_id": "user_object_id",
          "firstName": "Ashok",
          "lastName": "Bharwad",
          "profileImage": "https://s3.../photo.jpg"
        },
        "status": "PENDING",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 3,
      "totalPages": 1
    }
  },
  "message": "Follow requests fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4F.7 Remove Follower
**Response: 200**
```json
{
  "data": {
    "removed": true
  },
  "message": "Follower removed successfully",
  "toast": true,
  "responseType": "success"
}
```

### 4G. Search

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/social/search` | Yes | Search posts & users |

**Request:**
```json
GET /social/search?q=vijay&type=all&page=1&pageSize=10
// type: all | posts | users
```
**Response: 200**
```json
{
  "data": {
    "users": [
      {
        "_id": "user_object_id",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "profileImage": "https://s3.../photo.jpg"
      }
    ],
    "posts": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Search results fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 4H. Notifications

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/social/notifications` | Yes | Get notifications (paginated + unread count) |
| 2 | PUT | `/social/notifications/:notificationId/read` | Yes | Mark single notification as read |
| 3 | PUT | `/social/notifications/read-all` | Yes | Mark all notifications as read |

#### 4H.1 Get Notifications
**Response: 200**
```json
{
  "data": {
    "notifications": [
      {
        "_id": "notification_object_id",
        "senderId": {
          "_id": "user_object_id",
          "firstName": "Ashok",
          "lastName": "Bharwad",
          "profileImage": "https://s3.../photo.jpg"
        },
        "type": "LIKE",
        "title": "New Like",
        "message": "Ashok liked your post",
        "isRead": false,
        "referenceId": "post_object_id",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "message": "Notifications fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4H.2 Mark as Read
**Response: 200**
```json
{
  "data": {
    "_id": "notification_object_id",
    "isRead": true
  },
  "message": "Notification marked as read",
  "toast": false,
  "responseType": "success"
}
```

#### 4H.3 Mark All as Read
**Response: 200**
```json
{
  "data": {
    "updated": 15
  },
  "message": "All notifications marked as read",
  "toast": false,
  "responseType": "success"
}
```

### 4I. Block

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/block/:userId` | Yes | Block user |
| 2 | DELETE | `/social/block/:userId` | Yes | Unblock user |
| 3 | GET | `/social/blocked-users` | Yes | Get blocked users list |

#### 4I.1 Block User
**Response: 200**
```json
{
  "data": {
    "blockId": "block_object_id",
    "blockedUserId": "user_object_id"
  },
  "message": "User blocked successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4I.2 Unblock User
**Response: 200**
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

#### 4I.3 Get Blocked Users
**Response: 200**
```json
{
  "data": {
    "blockedUsers": [
      {
        "_id": "user_object_id",
        "firstName": "Spam",
        "lastName": "User",
        "profileImage": "https://s3.../photo.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 2,
      "totalPages": 1
    }
  },
  "message": "Blocked users fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 4J. Report

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/report/post/:postId` | Yes | Report a post |
| 2 | POST | `/social/report/user/:userId` | Yes | Report a user |
| 3 | POST | `/social/report/comment/:commentId` | Yes | Report a comment |

#### 4J.1 Report Post/User/Comment
**Request:**
```json
POST /social/report/post/:postId
Header: Authorization: Bearer <token>
Body:
{
  "reason": "Spam",
  "description": "This post contains spam links"
}
```
**Response: 200**
```json
{
  "data": {
    "reportId": "report_object_id",
    "status": "PENDING",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Post reported successfully",
  "toast": true,
  "responseType": "success"
}
```

### 4K. Profile & Account

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/social/profile/:userId` | Yes | Get user profile stats (posts/followers/following count) |
| 2 | GET | `/social/profile` | Yes | Get own profile stats |
| 3 | POST | `/social/account/deactivate` | Yes | Deactivate account (soft) |
| 4 | DELETE | `/social/account` | Yes | Delete account permanently |

#### 4K.1 Get Other User Profile
**Response: 200**
```json
{
  "data": {
    "user": {
      "_id": "user_object_id",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "profileImage": "https://s3.../photo.jpg"
    },
    "stats": {
      "postsCount": 42,
      "followersCount": 150,
      "followingCount": 85,
      "likeCount": 320
    },
    "isFollowing": true,
    "isBlocked": false
  },
  "message": "Profile stats fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4K.2 Get Own Profile
**Response: 200**
```json
{
  "data": {
    "user": {
      "_id": "user_object_id",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "profileImage": "https://s3.../photo.jpg"
    },
    "stats": {
      "postsCount": 42,
      "followersCount": 150,
      "followingCount": 85,
      "likeCount": 320
    }
  },
  "message": "Profile stats fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 4K.3 Deactivate Account
**Response: 200**
```json
{
  "data": {
    "deactivated": true
  },
  "message": "Account deactivated successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 4K.4 Delete Account
**Response: 200**
```json
{
  "data": {
    "deleted": true
  },
  "message": "Account deleted successfully",
  "toast": true,
  "responseType": "success"
}
```

---

## 5. FAMILY TREE MODULE (`/family`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/family/members` | Yes | Add a family member |
| 2 | GET | `/family/members` | Yes | Get all family members (flat list) |
| 3 | GET | `/family/tree` | Yes | Get family tree (grouped by relation) |
| 4 | GET | `/family/members/:memberId` | Yes | Get single member detail |
| 5 | PUT | `/family/members/:memberId` | Yes | Update family member |
| 6 | DELETE | `/family/members/:memberId` | Yes | Delete family member |
| 7 | POST | `/family/members/:memberId/link` | Yes | Link member to registered user |
| 8 | DELETE | `/family/members/:memberId/link` | Yes | Unlink member |

### 5.1 Add Family Member
**Request:**
```json
POST /family/members
Header: Authorization: Bearer <token>
Body:
{
  "relation": "BROTHER",         // SELF|FATHER|MOTHER|SPOUSE|BROTHER|SISTER|SON|DAUGHTER|GRANDFATHER|GRANDMOTHER|UNCLE|AUNT|COUSIN|OTHER
  "firstName": "Ashok",
  "lastName": "Bharwad",
  "dateOfBirth": "1990-10-25",
  "profileImage": "",
  "mobile": "9876543210"
}
```
**Response: 201**
```json
{
  "data": {
    "_id": "member_object_id",
    "headUserId": "user_object_id",
    "relation": "BROTHER",
    "firstName": "Ashok",
    "lastName": "Bharwad",
    "dateOfBirth": "1990-10-25T00:00:00.000Z",
    "profileImage": "",
    "mobile": "9876543210",
    "isRegistered": false,
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Family member added successfully",
  "toast": true,
  "responseType": "success"
}
```

### 5.2 Get All Members
**Response: 200**
```json
{
  "data": {
    "members": [
      {
        "_id": "member_object_id",
        "headUserId": "user_object_id",
        "relation": "BROTHER",
        "firstName": "Ashok",
        "lastName": "Bharwad",
        "profileImage": "",
        "isRegistered": false,
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 8,
      "totalPages": 1
    }
  },
  "message": "Family members fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 5.3 Get Family Tree
**Response: 200**
```json
{
  "data": {
    "SELF": [
      {
        "_id": "member_id",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "relation": "SELF",
        "isRegistered": true
      }
    ],
    "FATHER": [...],
    "MOTHER": [...],
    "SPOUSE": [...],
    "BROTHER": [...],
    "SISTER": [...]
  },
  "message": "Family tree fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 5.4 Get Single Member
**Response: 200**
```json
{
  "data": {
    "_id": "member_object_id",
    "headUserId": "user_object_id",
    "relation": "BROTHER",
    "firstName": "Ashok",
    "lastName": "Bharwad",
    "dateOfBirth": "1990-10-25T00:00:00.000Z",
    "profileImage": "",
    "mobile": "9876543210",
    "userId": null,
    "isRegistered": false,
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Family members fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 5.5 Update Member
**Response: 200**
```json
{
  "data": {
    "_id": "member_object_id",
    "relation": "BROTHER",
    "firstName": "Ashok Updated",
    "lastName": "Bharwad",
    "updatedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Family member updated successfully",
  "toast": true,
  "responseType": "success"
}
```

### 5.6 Delete Member
**Response: 200**
```json
{
  "data": {
    "memberId": "member_object_id"
  },
  "message": "Family member removed successfully",
  "toast": true,
  "responseType": "success"
}
```

### 5.7 Link Member to Registered User
**Request:**
```json
POST /family/members/:memberId/link
Header: Authorization: Bearer <token>
Body:
{
  "userId": "registered_user_object_id"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "member_object_id",
    "userId": "registered_user_object_id",
    "isRegistered": true
  },
  "message": "Family member linked to registered user successfully",
  "toast": true,
  "responseType": "success"
}
```

### 5.8 Unlink Member
**Response: 200**
```json
{
  "data": {
    "_id": "member_object_id",
    "userId": null,
    "isRegistered": false
  },
  "message": "Family member unlinked successfully",
  "toast": true,
  "responseType": "success"
}
```

---

## 6. MATRIMONIAL MODULE (`/matrimonial`)

### 6A. Profile Management

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/matrimonial/profiles` | Yes | Create profile (Step 1 - pick family member) |
| 2 | PUT | `/matrimonial/profiles/:profileId` | Yes | Update profile (any step) |
| 3 | POST | `/matrimonial/profiles/:profileId/submit` | Yes | Submit profile for admin review |
| 4 | DELETE | `/matrimonial/profiles/:profileId` | Yes | Delete profile |
| 5 | GET | `/matrimonial/profiles/me` | Yes | Get all my profiles |
| 6 | GET | `/matrimonial/profiles/browse` | Yes | Browse approved profiles (with filters) |
| 7 | GET | `/matrimonial/profiles/search` | Yes | Search profiles |
| 8 | GET | `/matrimonial/profiles/:profileId` | Yes | View profile detail (auto-tracks view) |
| 9 | GET | `/matrimonial/profiles/:profileId/viewers` | Yes | See who viewed your profile |
| 10 | POST | `/matrimonial/profiles/:profileId/toggle-hide` | Yes | Hide/unhide profile from browse |

#### 6A.1 Create Profile (Step 1)
**Request:**
```json
POST /matrimonial/profiles
Header: Authorization: Bearer <token>
Body:
{
  "createdForUserId": "family_member_object_id",
  "firstName": "Ashok",
  "lastName": "Bharwad",
  "dateOfBirth": "1990-10-25",
  "height": 175,
  "maritalStatus": "NEVER_MARRIED"    // NEVER_MARRIED|DIVORCED|WIDOWED|AWAITING_DIVORCE
}
```
**Response: 201**
```json
{
  "data": {
    "_id": "profile_object_id",
    "userId": "user_object_id",
    "createdForUserId": "family_member_object_id",
    "firstName": "Ashok",
    "lastName": "Bharwad",
    "dateOfBirth": "1990-10-25T00:00:00.000Z",
    "height": 175,
    "maritalStatus": "NEVER_MARRIED",
    "status": "DRAFT",
    "isActive": true,
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Matrimonial profile created successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6A.2 Update Profile (Steps 2-6)
**Request:**
```json
PUT /matrimonial/profiles/:profileId
Header: Authorization: Bearer <token>
// Step 2 - Community Details:
{
  "subCaste": "Bharwad",
  "gotra": "Kashyap",
  "nativePlace": "Ahmedabad",
  "currentCity": "Gandhinagar"
}
// Step 3 - Family Summary:
{
  "fatherName": "Ramesh Bharwad",
  "motherName": "Savita Bharwad",
  "familyType": "JOINT"              // NUCLEAR|JOINT|EXTENDED
}
// Step 4 - Education & Profession:
{
  "education": "Diploma Engineer",
  "profession": "UI/UX Designer",
  "company": "Indian PVT. LTD",
  "annualIncome": "5-10 LPA"
}
// Step 5 - Photos & About:
{
  "photos": ["https://s3.../photo1.jpg", "https://s3.../photo2.jpg"],
  "aboutCandidate": "I am a simple person..."
}
// Step 6 - Partner Preferences:
{
  "partnerPreferences": {
    "ageMin": 22,
    "ageMax": 30,
    "heightMin": 150,
    "heightMax": 175,
    "locationPreference": "Gujarat",
    "educationPreference": "Graduate",
    "maritalStatus": ["NEVER_MARRIED"]
  }
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "profile_object_id",
    "firstName": "Ashok",
    "lastName": "Bharwad",
    "status": "DRAFT",
    "updatedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Matrimonial profile updated successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6A.3 Submit for Review
**Response: 200**
```json
{
  "data": {
    "_id": "profile_object_id",
    "status": "UNDER_REVIEW",
    "submittedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Profile submitted for review successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6A.4 Delete Profile
**Response: 200**
```json
{
  "data": {
    "profileId": "profile_object_id"
  },
  "message": "Matrimonial profile deleted successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6A.5 Get My Profiles
**Response: 200**
```json
{
  "data": {
    "profiles": [
      {
        "_id": "profile_object_id",
        "firstName": "Ashok",
        "lastName": "Bharwad",
        "status": "APPROVED",
        "createdForUserId": {
          "_id": "family_member_id",
          "firstName": "Ashok",
          "relation": "BROTHER"
        }
      }
    ]
  },
  "message": "My matrimonial profiles fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6A.6 Browse Profiles (with filters)
**Request:**
```json
GET /matrimonial/profiles/browse?page=1&pageSize=10
GET /matrimonial/profiles/browse?ageMin=22&ageMax=30&city=Ahmedabad&education=Engineer
GET /matrimonial/profiles/browse?maritalStatus=NEVER_MARRIED&q=Anjali
```
**Response: 200**
```json
{
  "data": {
    "profiles": [
      {
        "_id": "profile_object_id",
        "firstName": "Anjali",
        "lastName": "Bharwad",
        "dateOfBirth": "1998-05-15T00:00:00.000Z",
        "height": 160,
        "maritalStatus": "NEVER_MARRIED",
        "education": "Graduate",
        "profession": "Teacher",
        "currentCity": "Ahmedabad",
        "photos": ["https://s3.../photo1.jpg"],
        "status": "APPROVED"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "message": "Matrimonial profiles fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6A.8 View Profile Detail
**Response: 200**
```json
{
  "data": {
    "_id": "profile_object_id",
    "userId": {
      "_id": "user_object_id",
      "firstName": "Vijay",
      "lastName": "Yadav",
      "profileImage": "https://s3.../photo.jpg"
    },
    "firstName": "Ashok",
    "lastName": "Bharwad",
    "dateOfBirth": "1990-10-25T00:00:00.000Z",
    "height": 175,
    "maritalStatus": "NEVER_MARRIED",
    "subCaste": "Bharwad",
    "gotra": "Kashyap",
    "education": "Diploma Engineer",
    "profession": "UI/UX Designer",
    "company": "Indian PVT. LTD",
    "annualIncome": "5-10 LPA",
    "photos": ["https://s3.../photo1.jpg"],
    "aboutCandidate": "I am a simple person...",
    "partnerPreferences": {
      "ageMin": 22,
      "ageMax": 30,
      "heightMin": 150,
      "heightMax": 175
    },
    "status": "APPROVED"
  },
  "message": "Matrimonial profile fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6A.9 Get Profile Viewers
**Response: 200**
```json
{
  "data": {
    "viewers": [
      {
        "_id": "user_object_id",
        "firstName": "Anjali",
        "lastName": "Bharwad",
        "profileImage": "https://s3.../photo.jpg",
        "viewedAt": "2026-03-28T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 12,
      "totalPages": 2
    }
  },
  "message": "Profile viewers fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6A.10 Toggle Hide Profile
**Response: 200**
```json
{
  "data": {
    "hidden": true
  },
  "message": "Profile hidden successfully",
  "toast": true,
  "responseType": "success"
}
```

### 6B. Shortlist

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/matrimonial/shortlist/:profileId` | Yes | Toggle shortlist (heart icon) |
| 2 | GET | `/matrimonial/shortlist` | Yes | Get shortlisted profiles |

#### 6B.1 Toggle Shortlist
**Response: 200**
```json
{
  "data": {
    "shortlisted": true,
    "shortlistId": "shortlist_object_id"
  },
  "message": "Profile shortlisted successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6B.2 Get Shortlisted
**Response: 200**
```json
{
  "data": {
    "profiles": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Shortlisted profiles fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 6C. Interest System

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/matrimonial/interests` | Yes | Send interest to a profile |
| 2 | GET | `/matrimonial/interests/sent` | Yes | Interest tab (my sent interests) |
| 3 | GET | `/matrimonial/interests/received` | Yes | Requests tab (received pending) |
| 4 | GET | `/matrimonial/interests/accepted` | Yes | View Profile tab (accepted matches) |
| 5 | PUT | `/matrimonial/interests/:interestId/respond` | Yes | Accept/Reject interest |
| 6 | DELETE | `/matrimonial/interests/:interestId` | Yes | Withdraw sent interest |

#### 6C.1 Send Interest
**Request:**
```json
POST /matrimonial/interests
Header: Authorization: Bearer <token>
Body:
{
  "fromProfileId": "my_profile_id",
  "toProfileId": "target_profile_id",
  "message": "I liked your profile"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "interest_object_id",
    "senderId": "user_object_id",
    "receiverProfileId": "profile_object_id",
    "status": "PENDING",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Interest sent successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6C.2 Get Sent Interests
**Response: 200**
```json
{
  "data": {
    "interests": [
      {
        "_id": "interest_object_id",
        "receiverProfile": {
          "_id": "profile_object_id",
          "firstName": "Anjali",
          "lastName": "Bharwad",
          "photos": ["https://s3.../photo.jpg"]
        },
        "status": "PENDING",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 3,
      "totalPages": 1
    }
  },
  "message": "Interests fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6C.3 Get Received Interests
**Response: 200**
```json
{
  "data": {
    "requests": [
      {
        "_id": "interest_object_id",
        "senderProfile": {
          "_id": "profile_object_id",
          "firstName": "Rahul",
          "lastName": "Bharwad",
          "photos": ["https://s3.../photo.jpg"]
        },
        "status": "PENDING",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 2,
      "totalPages": 1
    }
  },
  "message": "Interest requests fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6C.4 Get Accepted Interests
**Response: 200**
```json
{
  "data": {
    "profiles": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Interests fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 6C.5 Respond to Interest
**Request:**
```json
PUT /matrimonial/interests/:interestId/respond
Header: Authorization: Bearer <token>
Body:
{
  "action": "ACCEPTED"               // ACCEPTED | REJECTED
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "interest_object_id",
    "status": "ACCEPTED",
    "respondedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Interest accepted successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 6C.6 Withdraw Interest
**Response: 200**
```json
{
  "data": {
    "interestId": "interest_object_id"
  },
  "message": "Interest withdrawn successfully",
  "toast": true,
  "responseType": "success"
}
```

---

## 7. MESSAGING & CALL MODULE (`/messaging`)

### 7A. Chat Rooms

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/chats/direct` | Yes | Create 1:1 chat with a user |
| 2 | POST | `/messaging/chats/group` | Yes | Create group chat |
| 3 | GET | `/messaging/chats` | Yes | Get all my chat rooms |
| 4 | GET | `/messaging/chats/:roomId` | Yes | Get chat room detail |
| 5 | PUT | `/messaging/chats/:roomId` | Yes | Update group settings |
| 6 | POST | `/messaging/chats/:roomId/join` | Yes | Join public/password group |
| 7 | POST | `/messaging/chats/:roomId/leave` | Yes | Leave group |
| 8 | DELETE | `/messaging/chats/:roomId` | Yes | Delete group (owner only) |

#### 7A.1 Create Direct Chat
**Request:**
```json
POST /messaging/chats/direct
Header: Authorization: Bearer <token>
Body:
{
  "receiverId": "user_object_id"
}
```
**Response: 201**
```json
{
  "data": {
    "_id": "room_object_id",
    "type": "DIRECT",
    "participants": ["user_id_1", "user_id_2"],
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Chat room created successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7A.2 Create Group
**Request:**
```json
POST /messaging/chats/group
Header: Authorization: Bearer <token>
Body:
{
  "name": "Bharwad Family Group",
  "groupImage": "https://s3.../group.jpg",
  "groupType": "PUBLIC",             // PUBLIC | PRIVATE | PASSWORD
  "password": "",                    // only for PASSWORD type
  "description": "Family group chat",
  "memberIds": ["user_id_1", "user_id_2"]
}
```
**Response: 201**
```json
{
  "data": {
    "_id": "room_object_id",
    "type": "GROUP",
    "name": "Bharwad Family Group",
    "description": "Family group chat",
    "admin": "user_object_id",
    "members": [...],
    "avatar": "https://s3.../group.jpg",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Group created successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7A.3 Get My Chat Rooms
**Response: 200**
```json
{
  "data": {
    "chats": [
      {
        "_id": "room_object_id",
        "type": "DIRECT",
        "name": "Ashok Bharwad",
        "lastMessage": "Hello, how are you?",
        "unreadCount": 3,
        "lastMessageTime": "2026-03-28T11:00:00.000Z",
        "members": [...],
        "avatar": "https://s3.../photo.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 12,
      "totalPages": 1
    }
  },
  "message": "Chat rooms fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7A.4 Get Chat Room Detail
**Response: 200**
```json
{
  "data": {
    "_id": "room_object_id",
    "type": "GROUP",
    "name": "Bharwad Family Group",
    "members": [...],
    "admin": "user_object_id",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Chat room fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7A.5 Update Group
**Response: 200**
```json
{
  "data": {
    "_id": "room_object_id",
    "name": "Updated Group Name",
    "description": "Updated description",
    "avatar": "https://s3.../new-group.jpg",
    "updatedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Chat room updated successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7A.6 Join Group
**Request:**
```json
POST /messaging/chats/:roomId/join
Header: Authorization: Bearer <token>
Body:
{
  "password": "secret123"           // only needed for PASSWORD type groups
}
```
**Response: 200**
```json
{
  "data": {
    "joined": true,
    "roomId": "room_object_id"
  },
  "message": "Joined group successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7A.7 Leave Group
**Response: 200**
```json
{
  "data": {
    "left": true,
    "roomId": "room_object_id"
  },
  "message": "Left group successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7A.8 Delete Group
**Response: 200**
```json
{
  "data": {
    "roomId": "room_object_id"
  },
  "message": "Group deleted successfully",
  "toast": true,
  "responseType": "success"
}
```

### 7B. Group Management

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/messaging/groups` | Yes | Get my groups list |
| 2 | GET | `/messaging/chats/:roomId/members` | Yes | Get members (members + admins + moderators + banned) |
| 3 | POST | `/messaging/chats/:roomId/members` | Yes | Add members to group |
| 4 | DELETE | `/messaging/chats/:roomId/members/:userId` | Yes | Remove member |
| 5 | POST | `/messaging/chats/:roomId/ban/:userId` | Yes | Ban member |
| 6 | DELETE | `/messaging/chats/:roomId/ban/:userId` | Yes | Unban member |
| 7 | POST | `/messaging/chats/:roomId/admin/:userId` | Yes | Promote to admin |
| 8 | DELETE | `/messaging/chats/:roomId/admin/:userId` | Yes | Demote admin (owner only) |
| 9 | POST | `/messaging/chats/:roomId/moderator/:userId` | Yes | Promote to moderator |
| 10 | DELETE | `/messaging/chats/:roomId/moderator/:userId` | Yes | Demote moderator |

#### 7B.1 Get My Groups
**Response: 200**
```json
{
  "data": {
    "groups": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Chat rooms fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7B.2 Get Group Members
**Response: 200**
```json
{
  "data": {
    "members": [
      {
        "_id": "user_object_id",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "role": "ADMIN",
        "joinedAt": "2026-03-28T10:00:00.000Z"
      },
      {
        "_id": "user_object_id_2",
        "firstName": "Ashok",
        "lastName": "Bharwad",
        "role": "MEMBER",
        "joinedAt": "2026-03-28T10:05:00.000Z"
      }
    ]
  },
  "message": "Group members fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7B.3 Add Members
**Request:**
```json
POST /messaging/chats/:roomId/members
Header: Authorization: Bearer <token>
Body:
{
  "memberIds": ["user_id_1", "user_id_2", "user_id_3"]
}
```
**Response: 200**
```json
{
  "data": {
    "added": [
      {
        "_id": "user_id_1",
        "firstName": "Rahul",
        "role": "MEMBER"
      }
    ]
  },
  "message": "Member added to group successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.4 Remove Member
**Response: 200**
```json
{
  "data": { "userId": "user_object_id" },
  "message": "Member removed from group successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.5 Ban Member
**Response: 200**
```json
{
  "data": { "userId": "user_object_id", "banned": true },
  "message": "Member banned from group",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.6 Unban Member
**Response: 200**
```json
{
  "data": { "userId": "user_object_id", "banned": false },
  "message": "Member unbanned from group",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.7 Promote to Admin
**Response: 200**
```json
{
  "data": { "userId": "user_object_id", "role": "ADMIN" },
  "message": "Member promoted to admin",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.8 Demote Admin
**Response: 200**
```json
{
  "data": { "userId": "user_object_id", "role": "MEMBER" },
  "message": "Admin demoted to member",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.9 Promote to Moderator
**Response: 200**
```json
{
  "data": { "userId": "user_object_id", "role": "MODERATOR" },
  "message": "Member promoted to moderator",
  "toast": true,
  "responseType": "success"
}
```

#### 7B.10 Demote Moderator
**Response: 200**
```json
{
  "data": { "userId": "user_object_id", "role": "MEMBER" },
  "message": "Moderator demoted to member",
  "toast": true,
  "responseType": "success"
}
```

### 7C. Messages

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/chats/:roomId/messages` | Yes | Send message |
| 2 | GET | `/messaging/chats/:roomId/messages` | Yes | Get messages (auto-marks as read) |
| 3 | PUT | `/messaging/chats/:roomId/messages/:messageId` | Yes | Edit message |
| 4 | DELETE | `/messaging/chats/:roomId/messages/:messageId` | Yes | Delete message |
| 5 | GET | `/messaging/unread` | Yes | Get total unread message count |

#### 7C.1 Send Message
**Request:**
```json
POST /messaging/chats/:roomId/messages
Header: Authorization: Bearer <token>
Body:
// Text message:
{
  "messageType": "TEXT",
  "message": "Hello, how are you?"
}
// Image message:
{
  "messageType": "IMAGE",
  "message": "Check this out!",
  "mediaUrl": "https://s3.../photo.jpg"
}
// Reply to message:
{
  "messageType": "TEXT",
  "message": "I agree!",
  "replyToMessageId": "message_object_id"
}
// Video/Audio/File:
{
  "messageType": "VIDEO",           // VIDEO | AUDIO | FILE
  "mediaUrl": "https://s3.../video.mp4"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "message_object_id",
    "roomId": "room_object_id",
    "senderId": "user_object_id",
    "content": "Hello, how are you?",
    "mediaUrls": [],
    "reactions": [],
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Message sent successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7C.2 Get Messages
**Response: 200**
```json
{
  "data": {
    "messages": [
      {
        "_id": "message_object_id",
        "senderId": {
          "_id": "user_object_id",
          "firstName": "Vijay",
          "lastName": "Yadav"
        },
        "content": "Hello, how are you?",
        "mediaUrls": [],
        "reactions": [],
        "createdAt": "2026-03-28T10:00:00.000Z",
        "isEdited": false
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "message": "Messages fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7C.3 Edit Message
**Response: 200**
```json
{
  "data": {
    "_id": "message_object_id",
    "content": "Updated message!",
    "isEdited": true,
    "updatedAt": "2026-03-28T12:00:00.000Z"
  },
  "message": "Message updated successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7C.4 Delete Message
**Response: 200**
```json
{
  "data": {
    "messageId": "message_object_id"
  },
  "message": "Message deleted successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7C.5 Get Unread Count
**Response: 200**
```json
{
  "data": {
    "totalUnread": 15,
    "byRoom": {
      "room_id_1": 5,
      "room_id_2": 10
    }
  },
  "message": "Unread count fetched",
  "toast": false,
  "responseType": "success"
}
```

### 7D. Reactions

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/chats/:roomId/messages/:messageId/reactions` | Yes | Add/update emoji reaction |
| 2 | DELETE | `/messaging/chats/:roomId/messages/:messageId/reactions` | Yes | Remove your reaction |
| 3 | GET | `/messaging/chats/:roomId/messages/:messageId/reactions` | Yes | Get all reactions on message |

#### 7D.1 Add Reaction
**Request:**
```json
POST /messaging/chats/:roomId/messages/:messageId/reactions
Header: Authorization: Bearer <token>
Body:
{
  "emoji": "👍"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "reaction_object_id",
    "messageId": "message_object_id",
    "userId": "user_object_id",
    "emoji": "👍",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Reaction added successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7D.2 Remove Reaction
**Response: 200**
```json
{
  "data": { "removed": true },
  "message": "Reaction removed successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7D.3 Get Reactions
**Response: 200**
```json
{
  "data": {
    "reactions": [
      {
        "emoji": "👍",
        "count": 3,
        "users": ["user_id_1", "user_id_2", "user_id_3"]
      },
      {
        "emoji": "❤️",
        "count": 1,
        "users": ["user_id_4"]
      }
    ]
  },
  "message": "Reactions fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

### 7E. Mute & Clear

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/chats/:roomId/mute` | Yes | Mute chat notifications |
| 2 | DELETE | `/messaging/chats/:roomId/mute` | Yes | Unmute chat |
| 3 | GET | `/messaging/chats/:roomId/mute` | Yes | Get mute status |
| 4 | DELETE | `/messaging/chats/:roomId/history` | Yes | Clear your chat history |

#### 7E.1 Mute Chat
**Request:**
```json
POST /messaging/chats/:roomId/mute
Header: Authorization: Bearer <token>
Body:
{
  "mutedUntil": null               // null = mute forever
}
// Or mute for specific time:
{
  "mutedUntil": "2026-04-01T00:00:00Z"
}
```
**Response: 200**
```json
{
  "data": {
    "muted": true,
    "mutedUntil": null
  },
  "message": "Chat muted successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7E.2 Unmute Chat
**Response: 200**
```json
{
  "data": { "muted": false },
  "message": "Chat unmuted successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 7E.3 Get Mute Status
**Response: 200**
```json
{
  "data": {
    "muted": true,
    "mutedUntil": "2026-04-01T00:00:00.000Z"
  },
  "message": "Mute status fetched",
  "toast": false,
  "responseType": "success"
}
```

#### 7E.4 Clear Chat History
**Response: 200**
```json
{
  "data": { "cleared": true },
  "message": "Chat history cleared successfully",
  "toast": true,
  "responseType": "success"
}
```

### 7F. Calls

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/calls` | Yes | Create call log |
| 2 | GET | `/messaging/calls` | Yes | Get call history |
| 3 | GET | `/messaging/calls/:callId` | Yes | Get call detail (participants, recording) |
| 4 | PUT | `/messaging/calls/:callId` | Yes | Update call (duration, status, recording) |

#### 7F.1 Create Call
**Request:**
```json
POST /messaging/calls
Header: Authorization: Bearer <token>
Body:
{
  "receiverId": "user_object_id",
  "chatRoomId": "room_object_id",
  "callType": "VOICE"               // VOICE | VIDEO
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "call_object_id",
    "roomId": "room_object_id",
    "initiatorId": "user_object_id",
    "callType": "VOICE",
    "duration": 0,
    "status": "ONGOING",
    "createdAt": "2026-03-28T10:00:00.000Z"
  },
  "message": "Call log created successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7F.2 Get Call History
**Response: 200**
```json
{
  "data": {
    "calls": [
      {
        "_id": "call_object_id",
        "roomId": "room_object_id",
        "initiatorId": {
          "_id": "user_object_id",
          "firstName": "Vijay",
          "lastName": "Yadav"
        },
        "callType": "VOICE",
        "duration": 120,
        "status": "COMPLETED",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "Call logs fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7F.3 Get Call Detail
**Response: 200**
```json
{
  "data": {
    "_id": "call_object_id",
    "roomId": "room_object_id",
    "initiatorId": {...},
    "participantIds": [...],
    "callType": "VOICE",
    "duration": 120,
    "startTime": "2026-03-28T10:00:00.000Z",
    "endTime": "2026-03-28T10:02:00.000Z",
    "status": "COMPLETED"
  },
  "message": "Call detail fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 7F.4 Update Call (when call ends)
**Request:**
```json
PUT /messaging/calls/:callId
Header: Authorization: Bearer <token>
Body:
{
  "status": "OUTGOING",             // OUTGOING|INCOMING|MISSED|REJECTED
  "duration": 120,                   // seconds
  "startedAt": "2026-03-28T10:00:00Z",
  "endedAt": "2026-03-28T10:02:00Z",
  "recordingUrl": "https://s3.../recording.mp3"
}
```
**Response: 200**
```json
{
  "data": {
    "_id": "call_object_id",
    "status": "OUTGOING",
    "duration": 120,
    "updatedAt": "2026-03-28T10:02:00.000Z"
  },
  "message": "Call log updated successfully",
  "toast": false,
  "responseType": "success"
}
```

### 7G. Users

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/messaging/users/search` | Yes | Search users for new chat |

**Request:**
```json
GET /messaging/users/search?q=vijay&page=1&pageSize=20
```
**Response: 200**
```json
{
  "data": {
    "users": [
      {
        "_id": "user_object_id",
        "firstName": "Vijay",
        "lastName": "Yadav",
        "profileImage": "https://s3.../photo.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 3,
      "totalPages": 1
    }
  },
  "message": "Users fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

## 8. NEWS FEED MODULE (`/news`)

### 8A. Bookmarks

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/news/bookmarks` | Yes | Toggle bookmark article |
| 2 | GET | `/news/bookmarks` | Yes | Get my bookmarks |
| 3 | DELETE | `/news/bookmarks/:bookmarkId` | Yes | Remove bookmark |

#### 8A.1 Toggle Bookmark
**Request:**
```json
POST /news/bookmarks
Header: Authorization: Bearer <token>
Body:
{
  "articleUrl": "https://bbc.com/article/123",
  "title": "Ukraine's President Zelensky to BBC",
  "description": "Article description...",
  "imageUrl": "https://bbc.com/image.jpg",
  "sourceName": "BBC News",
  "sourceLogo": "https://bbc.com/logo.png",
  "publishedAt": "2026-03-28T10:00:00Z",
  "category": "Europe"
}
```
**Response: 200**
```json
{
  "data": {
    "bookmarked": true,
    "bookmarkId": "bookmark_object_id"
  },
  "message": "Article bookmarked successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 8A.2 Get Bookmarks
**Response: 200**
```json
{
  "data": {
    "bookmarks": [
      {
        "_id": "bookmark_object_id",
        "userId": "user_object_id",
        "articleUrl": "https://bbc.com/article/123",
        "title": "Ukraine's President Zelensky to BBC",
        "description": "Article description...",
        "imageUrl": "https://bbc.com/image.jpg",
        "sourceName": "BBC News",
        "sourceLogo": "https://bbc.com/logo.png",
        "category": "Europe",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Bookmarks fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 8A.3 Remove Bookmark
**Response: 200**
```json
{
  "data": { "removed": true },
  "message": "Bookmark removed successfully",
  "toast": true,
  "responseType": "success"
}
```

### 8B. Topics

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/news/topics` | Yes | Toggle save topic |
| 2 | GET | `/news/topics/me` | Yes | Get my saved topics |
| 3 | DELETE | `/news/topics/:topicSlug` | Yes | Remove saved topic |

#### 8B.1 Toggle Save Topic
**Request:**
```json
POST /news/topics
Header: Authorization: Bearer <token>
Body:
{
  "topicSlug": "technology",
  "topicName": "Technology"
}
```
**Response: 200**
```json
{
  "data": {
    "saved": true,
    "topicSlug": "technology"
  },
  "message": "Topic saved successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 8B.2 Get My Topics
**Response: 200**
```json
{
  "data": {
    "topics": [
      {
        "_id": "topic_object_id",
        "userId": "user_object_id",
        "topicSlug": "technology",
        "topicName": "Technology",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ]
  },
  "message": "My saved topics fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 8B.3 Remove Topic
**Response: 200**
```json
{
  "data": { "removed": true },
  "message": "Topic removed successfully",
  "toast": true,
  "responseType": "success"
}
```

### 8C. Authors

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/news/authors` | Yes | Toggle follow author |
| 2 | GET | `/news/authors/me` | Yes | Get my followed authors |
| 3 | DELETE | `/news/authors/:authorSlug` | Yes | Unfollow author |

#### 8C.1 Toggle Follow Author
**Request:**
```json
POST /news/authors
Header: Authorization: Bearer <token>
Body:
{
  "authorSlug": "bbc-news",
  "authorName": "BBC News",
  "authorLogo": "https://bbc.com/logo.png"
}
```
**Response: 200**
```json
{
  "data": {
    "following": true,
    "authorSlug": "bbc-news"
  },
  "message": "Author followed successfully",
  "toast": true,
  "responseType": "success"
}
```

#### 8C.2 Get My Authors
**Response: 200**
```json
{
  "data": {
    "authors": [
      {
        "_id": "author_object_id",
        "userId": "user_object_id",
        "authorSlug": "bbc-news",
        "authorName": "BBC News",
        "authorLogo": "https://bbc.com/logo.png",
        "followedAt": "2026-03-28T10:00:00.000Z"
      }
    ]
  },
  "message": "My followed authors fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

#### 8C.3 Unfollow Author
**Response: 200**
```json
{
  "data": { "removed": true },
  "message": "Author unfollowed successfully",
  "toast": true,
  "responseType": "success"
}
```

### 8D. Search

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/news/search` | Yes | Search topics + authors |

**Request:**
```json
GET /news/search?q=technology&type=all&page=1&pageSize=20
// type: all | topics | authors
```
**Response: 200**
```json
{
  "data": {
    "topics": [...],
    "authors": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "Search results fetched successfully",
  "toast": false,
  "responseType": "success"
}
```

---

## 9. CRON MODULE (`/cron`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/cron/story-cleanup` | Cron Secret | Delete expired stories (called by AWS CloudWatch) |

**Request:**
```json
POST /cron/story-cleanup
Header: x-cron-secret: your-cron-secret-key-here
```
**Response: 200**
```json
{
  "data": {
    "deleted": 12,
    "processed": 50,
    "completedAt": "2026-03-28T00:00:00.000Z"
  },
  "message": "Story cleanup completed",
  "toast": false,
  "responseType": "success"
}
```

---

## Testing Flow in Postman

### Step 1: Auth
1. Call **Send OTP** → note the OTP from server logs (dev mode)
2. Call **Verify OTP** → save `accessToken` and `refreshToken`
3. Set `accessToken` as Bearer token in Postman collection

### Step 2: Complete Onboarding
4. Call **Complete Profile** → personal info
5. Call **Upload Documents** x 3 (ADDRESS_PROOF, EDUCATION_PROOF, OTHER)
6. Admin: **Login** → **List KYC** → **Review Documents** (approve all)
7. Call **Get Me** → should show `screen: HOME`

### Step 3: Test Social Media
8. Create a post → Like → Comment → Save → Share
9. Create a story → View story feed
10. Follow another user → Accept follow request

### Step 4: Test Family Tree
11. Add family members (SELF, FATHER, MOTHER, etc.)
12. Get family tree

### Step 5: Test Matrimonial
13. Create matrimonial profile → Update steps → Submit
14. Admin: Review → Approve
15. Browse profiles → Send interest → Accept interest

### Step 6: Test Messaging
16. Create direct chat → Send messages → Add reactions
17. Create group → Add members → Promote admin
18. Create call log

### Step 7: Test News Feed
19. Bookmark article → Save topic → Follow author
