export const MESSAGING_MESSAGES = Object.freeze({
  // Chat Room
  ROOM_CREATED: 'Chat room created successfully',
  ROOM_NOT_FOUND: 'Chat room not found',
  ROOM_FETCHED: 'Chat room fetched successfully',
  ROOMS_FETCHED: 'Chat rooms fetched successfully',
  ROOM_UPDATED: 'Chat room updated successfully',
  ROOM_DELETED: 'Chat room deleted successfully',
  ROOM_UNAUTHORIZED: 'You are not a participant of this chat room',
  DIRECT_ROOM_EXISTS: 'Direct chat already exists with this user',
  CANNOT_CHAT_SELF: 'You cannot create a chat with yourself',

  // Group
  GROUP_CREATED: 'Group created successfully',
  GROUP_UPDATED: 'Group updated successfully',
  MEMBER_ADDED: 'Member added to group successfully',
  MEMBER_REMOVED: 'Member removed from group successfully',
  MEMBER_BANNED: 'Member banned from group',
  MEMBER_UNBANNED: 'Member unbanned from group',
  LEFT_GROUP: 'Left group successfully',
  GROUP_DELETED: 'Group deleted successfully',
  NOT_GROUP_ADMIN: 'You are not an admin of this group',
  NOT_GROUP_OWNER: 'Only the group owner can perform this action',
  ALREADY_MEMBER: 'User is already a member of this group',
  NOT_A_MEMBER: 'User is not a member of this group',
  USER_IS_BANNED: 'User is banned from this group',
  WRONG_PASSWORD: 'Incorrect group password',
  MEMBERS_FETCHED: 'Group members fetched successfully',

  // Message
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_FETCHED: 'Message fetched successfully',
  MESSAGES_FETCHED: 'Messages fetched successfully',
  MESSAGE_UPDATED: 'Message updated successfully',
  MESSAGE_DELETED: 'Message deleted successfully',
  MESSAGE_NOT_FOUND: 'Message not found',
  MESSAGE_UNAUTHORIZED: 'You are not authorized to modify this message',

  // Reaction
  REACTION_ADDED: 'Reaction added successfully',
  REACTION_REMOVED: 'Reaction removed successfully',
  REACTIONS_FETCHED: 'Reactions fetched successfully',

  // Call
  CALL_CREATED: 'Call log created successfully',
  CALL_UPDATED: 'Call log updated successfully',
  CALL_NOT_FOUND: 'Call log not found',
  CALLS_FETCHED: 'Call logs fetched successfully',
  CALL_DETAIL_FETCHED: 'Call detail fetched successfully',

  // Users
  USERS_FETCHED: 'Users fetched successfully',

  // Role Management
  MADE_ADMIN: 'Member promoted to admin',
  REMOVED_ADMIN: 'Admin demoted to member',
  MADE_MODERATOR: 'Member promoted to moderator',
  REMOVED_MODERATOR: 'Moderator demoted to member',

  // Mute
  CHAT_MUTED: 'Chat muted successfully',
  CHAT_UNMUTED: 'Chat unmuted successfully',
  MUTE_STATUS_FETCHED: 'Mute status fetched',

  // Clear History
  CHAT_CLEARED: 'Chat history cleared successfully',

  // Translate
  MESSAGE_TRANSLATED: 'Message translated successfully',
});
