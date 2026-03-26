import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import FamilyTreeRepo from '@/repository/familyTree.repository';
import { FAMILY_TREE_MESSAGES } from '@/messages/familyTree.messages';

export class FamilyTreeController {
  constructor(private readonly familyTreeRepo: FamilyTreeRepo) {}

  readonly addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.addMember(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBER_ADDED, 'success', true, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly updateMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.updateMember(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBER_UPDATED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly deleteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.deleteMember(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBER_DELETED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getMyFamily = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.getMyFamily(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBERS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getFamilyTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.getFamilyTree(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.TREE_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.getMember(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBERS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly linkMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.linkMember(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBER_LINKED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly unlinkMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.familyTreeRepo.unlinkMember(req);
      return generalResponse(res, result, FAMILY_TREE_MESSAGES.MEMBER_UNLINKED, 'success', true);
    } catch (error) {
      next(error);
    }
  };
}
