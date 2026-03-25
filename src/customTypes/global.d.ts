import { AuthUser } from "@/models/mongoose/interfaces/user.model.interface";

declare global {
  namespace Express {
    interface Request {
      userTokenData?: AuthUser;
      adminTokenData?: {
        adminId: string;
      };
    }
  }
}
