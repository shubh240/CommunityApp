// messages/admin.messages.ts
export const ADMIN_MESSAGES = Object.freeze({
  LOGIN_SUCCESS: 'Admin logged in successfully',
  INVALID_CREDENTIALS: 'Invalid mobile or password',
  ADMIN_BLOCKED: 'Admin account is disabled',
  USERS_UNDER_REVIEW_FETCHED: 'Your Documents is under review',
  LIST_SUBMITTED_KYC: 'Submitted KYC users fetched successfully',

  DOC_APPROVED: 'Document approved',
  DOC_REJECTED: 'Document rejected',
  DOC_NOT_FOUND: 'Document not found',
  INVALID_ACTION: 'Invalid action',
  REJECTED_BY_ADMIN: 'Rejected by admin',

  REGISTER_SUCCESS: 'Admin registered successfully',
  ACCESS_REFRESHED: 'Access token refreshed',
  LOGOUT_SUCCESS: 'Logged out successfully',
  ADMIN_ALREADY_EXISTS: 'Admin already exists with this mobile',
  EMAIL_ALREADY_EXISTS: 'Admin already exists with this email',

  // Profile
  PROFILE_FETCHED: 'Admin profile fetched successfully',
  PROFILE_UPDATED: 'Admin profile updated successfully',
  ADMIN_NOT_FOUND: 'Admin not found',

  // Password
  PASSWORD_CHANGED: 'Password changed successfully',
  CURRENT_PASSWORD_WRONG: 'Current password is incorrect',
  PASSWORD_RESET: 'Password reset successfully',

  // Forgot Password OTP
  OTP_SENT: 'OTP sent to your registered mobile',
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_INVALID: 'Invalid or expired OTP',
  RESET_TOKEN_INVALID: 'Invalid or expired reset token',
  RESET_TOKEN_USED: 'This reset token has already been used',

  // User Management
  USERS_FETCHED: 'Users fetched successfully',
  USER_FETCHED: 'User fetched successfully',
  USER_NOT_FOUND: 'User not found',
  USER_BLOCKED: 'User blocked successfully',
  USER_UNBLOCKED: 'User unblocked successfully',
  USER_DELETED: 'User deleted successfully',
  USER_STATS_FETCHED: 'User stats fetched successfully',

  // Reports
  REPORTS_FETCHED: 'Reports fetched successfully',
  REPORT_FETCHED: 'Report fetched successfully',
  REPORT_NOT_FOUND: 'Report not found',
  REPORT_ACTION_TAKEN: 'Action taken on report successfully',

  // Moderation
  POSTS_FETCHED: 'Posts fetched successfully',
  POST_NOT_FOUND: 'Post not found',
  POST_DELETED: 'Post deleted successfully',
  STORIES_FETCHED: 'Stories fetched successfully',
  STORY_NOT_FOUND: 'Story not found',
  STORY_DELETED: 'Story deleted successfully',
  GROUPS_FETCHED: 'Groups fetched successfully',
  GROUP_NOT_FOUND: 'Group not found',
  GROUP_FETCHED: 'Group fetched successfully',
  GROUP_DELETED: 'Group deleted successfully',

  // Dashboard
  DASHBOARD_FETCHED: 'Dashboard stats fetched successfully',
  GROWTH_FETCHED: 'Growth stats fetched successfully',

  // Broadcast
  BROADCAST_SENT: 'Broadcast notification sent successfully',

  // Matrimonial
  MATRIMONIAL_PROFILES_FETCHED: 'Matrimonial profiles fetched successfully',
  MATRIMONIAL_PROFILE_FETCHED: 'Matrimonial profile fetched successfully',
  MATRIMONIAL_PROFILE_REVIEWED: 'Matrimonial profile reviewed successfully',
});
