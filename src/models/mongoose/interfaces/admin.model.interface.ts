export interface AdminAttributes extends Document {
  name: string;
  email: string;
  mobile: number;
  password: string;
  profileImage?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}