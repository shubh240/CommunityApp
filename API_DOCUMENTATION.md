# Community App Backend - API Documentation

**Base URL:** `http://localhost:5000/api/v1`

## Authentication
All protected routes require:
```
Header: Authorization: Bearer <access_token>
```

---

## 1. AUTH MODULE (`/user/auth`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/user/auth/sendOtp` | No | Send OTP to mobile number for login/signup |
| 2 | POST | `/user/auth/verifyOtp` | No | Verify OTP and get access + refresh tokens |
| 3 | POST | `/user/auth/refresh-token` | No | Get new access token using refresh token |
| 4 | POST | `/user/auth/logout` | Yes | Logout and revoke token |

### 1.1 Send OTP
```json
POST /user/auth/sendOtp
Body:
{
  "mobile": "9876543210"
}
```

### 1.2 Verify OTP
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

### 1.3 Refresh Token
```json
POST /user/auth/refresh-token
Body:
{
  "refreshToken": "your-refresh-token",
  "deviceId": "device-123"
}
```

### 1.4 Logout
```json
POST /user/auth/logout
Header: Authorization: Bearer <token>
Body:
{
  "deviceId": "device-123"
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
```json
GET /user/auth/me
Header: Authorization: Bearer <token>
Response: user profile + navigation screen (tells frontend which screen to show)
```

### 2.2 Complete Profile
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

### 2.3 Upload Documents
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

### 2.4 Re-Upload Documents (after rejection)
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

---

## 3. ADMIN MODULE (`/admin`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/admin/login` | No | Admin login with mobile + password |
| 2 | GET | `/admin/kyc/submitted` | Admin | List users pending KYC review |
| 3 | POST | `/admin/reviewUserDocument` | Admin | Approve/Reject user KYC document |
| 4 | GET | `/admin/matrimonial/profiles` | Admin | List matrimonial profiles for review |
| 5 | POST | `/admin/matrimonial/review` | Admin | Approve/Reject matrimonial profile |

### 3.1 Admin Login
```json
POST /admin/login
Body:
{
  "mobile": 9876543210,
  "password": "admin123"
}
```

### 3.2 List KYC Users
```json
GET /admin/kyc/submitted?kycStatus=UNDER_REVIEW&page=1&pageSize=10
Header: Authorization: Bearer <admin_token>
```

### 3.3 Review User Document
```json
POST /admin/reviewUserDocument
Header: Authorization: Bearer <admin_token>
Body:
{
  "userId": "user_object_id",
  "docId": "document_object_id",
  "action": "APPROVED"           // APPROVED | REJECTED
}
// If REJECTED:
{
  "userId": "...",
  "docId": "...",
  "action": "REJECTED",
  "rejectionReason": "Document is blurry, please re-upload"
}
```

### 3.4 List Matrimonial Profiles
```json
GET /admin/matrimonial/profiles?status=UNDER_REVIEW&page=1&pageSize=10
Header: Authorization: Bearer <admin_token>
```

### 3.5 Review Matrimonial Profile
```json
POST /admin/matrimonial/review
Header: Authorization: Bearer <admin_token>
Body:
{
  "profileId": "profile_object_id",
  "action": "APPROVED"
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
// For text-only post:
{
  "content": "Hello world!",
  "postType": "TEXT"
}
```

#### 4A.2 Update Post
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

#### 4A.4 Get Feed
```json
GET /social/posts/feed?page=1&pageSize=10
GET /social/posts/feed?page=1&pageSize=10&postType=VIDEO   // Videos tab
Header: Authorization: Bearer <token>
```

### 4B. Likes

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts/:postId/like` | Yes | Toggle like/unlike |
| 2 | GET | `/social/posts/:postId/likes` | Yes | Get list of users who liked |

### 4C. Comments

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts/:postId/comments` | Yes | Add comment (or reply) |
| 2 | GET | `/social/posts/:postId/comments` | Yes | Get comments with replies |
| 3 | PUT | `/social/posts/:postId/comments/:commentId` | Yes | Edit comment |
| 4 | DELETE | `/social/posts/:postId/comments/:commentId` | Yes | Delete comment |
| 5 | POST | `/social/posts/:postId/comments/:commentId/like` | Yes | Toggle comment like |

#### 4C.1 Add Comment
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

### 4D. Save

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/posts/:postId/save` | Yes | Toggle save/unsave post |

### 4E. Stories

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/stories` | Yes | Create story (24hr expiry) |
| 2 | GET | `/social/stories/feed` | Yes | Get stories feed (grouped by user) |
| 3 | POST | `/social/stories/:storyId/view` | Yes | Mark story as viewed |
| 4 | GET | `/social/stories/:storyId/views` | Yes | Get who viewed your story |
| 5 | DELETE | `/social/stories/:storyId` | Yes | Delete story |

#### 4E.1 Create Story
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

#### 4F.2 Respond to Follow Request
```json
POST /social/follow/respond
Header: Authorization: Bearer <token>
Body:
{
  "requestId": "follow_object_id",
  "action": "ACCEPTED"           // ACCEPTED | REJECTED
}
```

### 4G. Search

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/social/search` | Yes | Search posts & users |

```json
GET /social/search?q=vijay&type=all&page=1&pageSize=10
// type: all | posts | users
```

### 4H. Notifications

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/social/notifications` | Yes | Get notifications (paginated + unread count) |
| 2 | PUT | `/social/notifications/:notificationId/read` | Yes | Mark single notification as read |
| 3 | PUT | `/social/notifications/read-all` | Yes | Mark all notifications as read |

### 4I. Block

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/block/:userId` | Yes | Block user |
| 2 | DELETE | `/social/block/:userId` | Yes | Unblock user |
| 3 | GET | `/social/blocked-users` | Yes | Get blocked users list |

### 4J. Report

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/social/report/post/:postId` | Yes | Report a post |
| 2 | POST | `/social/report/user/:userId` | Yes | Report a user |
| 3 | POST | `/social/report/comment/:commentId` | Yes | Report a comment |

#### 4J.1 Report Post
```json
POST /social/report/post/:postId
Header: Authorization: Bearer <token>
Body:
{
  "reason": "Spam",
  "description": "This post contains spam links"
}
```

### 4K. Profile & Account

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/social/profile/:userId` | Yes | Get user profile stats (posts/followers/following count) |
| 2 | GET | `/social/profile` | Yes | Get own profile stats |
| 3 | POST | `/social/account/deactivate` | Yes | Deactivate account (soft) |
| 4 | DELETE | `/social/account` | Yes | Delete account permanently |

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

### 5.7 Link Member to Registered User
```json
POST /family/members/:memberId/link
Header: Authorization: Bearer <token>
Body:
{
  "userId": "registered_user_object_id"
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

#### 6A.2 Update Profile (Steps 2-6)
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

#### 6A.6 Browse Profiles (with filters)
```json
GET /matrimonial/profiles/browse?page=1&pageSize=10
GET /matrimonial/profiles/browse?ageMin=22&ageMax=30&city=Ahmedabad&education=Engineer
GET /matrimonial/profiles/browse?maritalStatus=NEVER_MARRIED&q=Anjali
```

### 6B. Shortlist

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/matrimonial/shortlist/:profileId` | Yes | Toggle shortlist (heart icon) |
| 2 | GET | `/matrimonial/shortlist` | Yes | Get shortlisted profiles |

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

#### 6C.5 Respond to Interest
```json
PUT /matrimonial/interests/:interestId/respond
Header: Authorization: Bearer <token>
Body:
{
  "action": "ACCEPTED"               // ACCEPTED | REJECTED
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
```json
POST /messaging/chats/direct
Header: Authorization: Bearer <token>
Body:
{
  "receiverId": "user_object_id"
}
```

#### 7A.2 Create Group
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

#### 7A.6 Join Group
```json
POST /messaging/chats/:roomId/join
Header: Authorization: Bearer <token>
Body:
{
  "password": "secret123"           // only needed for PASSWORD type groups
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

#### 7B.3 Add Members
```json
POST /messaging/chats/:roomId/members
Header: Authorization: Bearer <token>
Body:
{
  "memberIds": ["user_id_1", "user_id_2", "user_id_3"]
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

### 7D. Reactions

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/chats/:roomId/messages/:messageId/reactions` | Yes | Add/update emoji reaction |
| 2 | DELETE | `/messaging/chats/:roomId/messages/:messageId/reactions` | Yes | Remove your reaction |
| 3 | GET | `/messaging/chats/:roomId/messages/:messageId/reactions` | Yes | Get all reactions on message |

#### 7D.1 Add Reaction
```json
POST /messaging/chats/:roomId/messages/:messageId/reactions
Header: Authorization: Bearer <token>
Body:
{
  "emoji": "👍"
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

### 7F. Calls

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/messaging/calls` | Yes | Create call log |
| 2 | GET | `/messaging/calls` | Yes | Get call history |
| 3 | GET | `/messaging/calls/:callId` | Yes | Get call detail (participants, recording) |
| 4 | PUT | `/messaging/calls/:callId` | Yes | Update call (duration, status, recording) |

#### 7F.1 Create Call
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

#### 7F.4 Update Call (when call ends)
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

### 7G. Users

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/messaging/users/search` | Yes | Search users for new chat |

```json
GET /messaging/users/search?q=vijay&page=1&pageSize=20
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

### 8B. Topics

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/news/topics` | Yes | Toggle save topic |
| 2 | GET | `/news/topics/me` | Yes | Get my saved topics |
| 3 | DELETE | `/news/topics/:topicSlug` | Yes | Remove saved topic |

#### 8B.1 Toggle Save Topic
```json
POST /news/topics
Header: Authorization: Bearer <token>
Body:
{
  "topicSlug": "technology",
  "topicName": "Technology"
}
```

### 8C. Authors

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/news/authors` | Yes | Toggle follow author |
| 2 | GET | `/news/authors/me` | Yes | Get my followed authors |
| 3 | DELETE | `/news/authors/:authorSlug` | Yes | Unfollow author |

#### 8C.1 Toggle Follow Author
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

### 8D. Search

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/news/search` | Yes | Search topics + authors |

```json
GET /news/search?q=technology&type=all&page=1&pageSize=20
// type: all | topics | authors
```

---

## 9. CRON MODULE (`/cron`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/cron/story-cleanup` | Cron Secret | Delete expired stories (called by AWS CloudWatch) |

```json
POST /cron/story-cleanup
Header: x-cron-secret: your-cron-secret-key-here
```

---

## Testing Flow in Postman

### Step 1: Auth
1. Call **Send OTP** → note the OTP from server logs (dev mode)
2. Call **Verify OTP** → save `accessToken` and `refreshToken`
3. Set `accessToken` as Bearer token in Postman collection

### Step 2: Complete Onboarding
4. Call **Complete Profile** → personal info
5. Call **Upload Documents** × 3 (ADDRESS_PROOF, EDUCATION_PROOF, OTHER)
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
