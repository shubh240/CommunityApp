import { Document, Types } from 'mongoose';

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO';
export type PostVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export interface PostCheckin {
  location: string;
  latitude: number;
  longitude: number;
}

export interface PostAttributes extends Document {
  userId: Types.ObjectId;
  content: string;
  postType: PostType;
  visibility: PostVisibility;

  // New Post extras (from Figma: Photos, Check in, Feeling, Tag People)
  feeling: string;              // e.g. "Happy", "Sad", "Excited"
  checkin: PostCheckin | null;  // location check-in
  taggedUsers: Types.ObjectId[]; // tagged user ids

  likeCount: number;
  commentCount: number;
  shareCount: number;
  isDeleted: boolean;
}
