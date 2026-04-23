import { AuthUser } from "@/models/mongoose/interfaces/user.model.interface";

declare global {
  namespace Express {
    interface Request {
      // Populated by userAuthMiddleware - guaranteed to exist in authenticated routes
      userTokenData: AuthUser;
      // Populated by adminAuthMiddleware - guaranteed to exist in admin-authenticated routes
      adminTokenData: {
        adminId: string;
      };
    }
  }
}
