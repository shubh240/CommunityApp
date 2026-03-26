import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { FamilyTreeController } from '@/controllers/familyTree.controller';
import FamilyTreeRepo from '@/repository/familyTree.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import {
  addMemberSchema,
  updateMemberSchema,
  memberIdParamSchema,
  linkMemberSchema,
  familyPaginationSchema,
} from '@/validationSchema/familyTree.validation.schema';

class FamilyTreeRoute implements Routes {
  public path = '/family';
  public router = Router();
  public controller = new FamilyTreeController(new FamilyTreeRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = userAuthMiddleware();

    // Add a family member
    this.router.post(
      `${this.path}/members`,
      auth,
      validationMiddleware(addMemberSchema, 'body'),
      this.controller.addMember,
    );

    // Get all family members (flat list with optional relation filter)
    this.router.get(
      `${this.path}/members`,
      auth,
      validationMiddleware(familyPaginationSchema, 'query'),
      this.controller.getMyFamily,
    );

    // Get family tree (grouped by relation)
    this.router.get(
      `${this.path}/tree`,
      auth,
      this.controller.getFamilyTree,
    );

    // Get single member
    this.router.get(
      `${this.path}/members/:memberId`,
      auth,
      validationMiddleware(memberIdParamSchema, 'params'),
      this.controller.getMember,
    );

    // Update a family member
    this.router.put(
      `${this.path}/members/:memberId`,
      auth,
      validationMiddleware(memberIdParamSchema, 'params'),
      validationMiddleware(updateMemberSchema, 'body'),
      this.controller.updateMember,
    );

    // Delete a family member
    this.router.delete(
      `${this.path}/members/:memberId`,
      auth,
      validationMiddleware(memberIdParamSchema, 'params'),
      this.controller.deleteMember,
    );

    // Link member to a registered user
    this.router.post(
      `${this.path}/members/:memberId/link`,
      auth,
      validationMiddleware(memberIdParamSchema, 'params'),
      validationMiddleware(linkMemberSchema, 'body'),
      this.controller.linkMember,
    );

    // Unlink member from registered user
    this.router.delete(
      `${this.path}/members/:memberId/link`,
      auth,
      validationMiddleware(memberIdParamSchema, 'params'),
      this.controller.unlinkMember,
    );
  }
}

export default FamilyTreeRoute;
