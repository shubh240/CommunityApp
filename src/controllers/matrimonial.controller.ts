import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import MatrimonialProfileRepo from '@/repository/matrimonialProfile.repository';
import MatrimonialInterestRepo from '@/repository/matrimonialInterest.repository';
import { MATRIMONIAL_MESSAGES } from '@/messages/matrimonial.messages';

export class MatrimonialController {
  constructor(
    private readonly profileRepo: MatrimonialProfileRepo,
    private readonly interestRepo: MatrimonialInterestRepo,
  ) {}

  // ═══════════════════════════════════════════════════
  //  PROFILE
  // ═══════════════════════════════════════════════════

  readonly createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.createProfile(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILE_CREATED, 'success', true, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.updateProfile(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILE_UPDATED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly submitProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.submitProfile(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILE_SUBMITTED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.deleteProfile(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILE_DELETED, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getMyProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.getMyProfiles(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.MY_PROFILES_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.getProfile(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILE_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly browseProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.browseProfiles(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILES_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly searchProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.searchProfiles(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.SEARCH_RESULTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getProfileViewers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.getProfileViewers(req);
      return generalResponse(res, result, 'Profile viewers fetched successfully', 'success');
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  SHORTLIST & HIDE
  // ═══════════════════════════════════════════════════

  readonly toggleShortlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.toggleShortlist(req);
      const message = result.shortlisted
        ? MATRIMONIAL_MESSAGES.PROFILE_SHORTLISTED
        : MATRIMONIAL_MESSAGES.PROFILE_UNSHORTLISTED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getShortlistedProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.getShortlistedProfiles(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.SHORTLISTED_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly toggleHideProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.profileRepo.toggleHideProfile(req);
      const message = result.hidden
        ? MATRIMONIAL_MESSAGES.PROFILE_HIDDEN
        : MATRIMONIAL_MESSAGES.PROFILE_UNHIDDEN;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  // ═══════════════════════════════════════════════════
  //  INTEREST
  // ═══════════════════════════════════════════════════

  readonly sendInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.interestRepo.sendInterest(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.INTEREST_SENT, 'success', true, 201);
    } catch (error) {
      next(error);
    }
  };

  readonly respondToInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.interestRepo.respondToInterest(req);
      const message = result.status === 'ACCEPTED'
        ? MATRIMONIAL_MESSAGES.INTEREST_ACCEPTED
        : MATRIMONIAL_MESSAGES.INTEREST_REJECTED;
      return generalResponse(res, result, message, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly withdrawInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.interestRepo.withdrawInterest(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.INTEREST_WITHDRAWN, 'success', true);
    } catch (error) {
      next(error);
    }
  };

  readonly getSentInterests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.interestRepo.getSentInterests(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.INTERESTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getReceivedRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.interestRepo.getReceivedRequests(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.REQUESTS_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };

  readonly getViewProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.interestRepo.getViewProfiles(req);
      return generalResponse(res, result, MATRIMONIAL_MESSAGES.PROFILES_FETCHED, 'success');
    } catch (error) {
      next(error);
    }
  };
}
