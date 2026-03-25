import { AdminType } from '@/models/mongoose/admin.model';

export type TokenDataInterface = {
  admin: AdminType;
};

export type jwtPayloadAdmin = {
  mobile: string;
  adminId: string;
};

export type jwtPayloadUser = {
  mobile: string;
  userId: string;
  email: string;
};
