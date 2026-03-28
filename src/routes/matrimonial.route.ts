import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { MatrimonialController } from '@/controllers/matrimonial.controller';
import MatrimonialProfileRepo from '@/repository/matrimonialProfile.repository';
import MatrimonialInterestRepo from '@/repository/matrimonialInterest.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { userAuthMiddleware } from '@/middlewares/userAuth.middleware';
import {
  createProfileSchema,
  updateProfileSchema,
  profileIdParamSchema,
  interestIdParamSchema,
  sendInterestSchema,
  respondInterestSchema,
  browseProfilesSchema,
  matrimonialPaginationSchema,
} from '@/validationSchema/matrimonial.validation.schema';

class MatrimonialRoute implements Routes {
  public path = '/matrimonial';
  public router = Router();
  public controller = new MatrimonialController(
    new MatrimonialProfileRepo(),
    new MatrimonialInterestRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = userAuthMiddleware();

    // ─── Profile Routes ─────────────────────────────

    // Create profile (Step 1)
    this.router.post(
      `${this.path}/profiles`,
      auth,
      validationMiddleware(createProfileSchema, 'body'),
      this.controller.createProfile,
    );

    // Get my profiles
    this.router.get(
      `${this.path}/profiles/me`,
      auth,
      this.controller.getMyProfiles,
    );

    // Browse approved profiles (home/grid)
    this.router.get(
      `${this.path}/profiles/browse`,
      auth,
      validationMiddleware(browseProfilesSchema, 'query'),
      this.controller.browseProfiles,
    );

    // Search profiles
    this.router.get(
      `${this.path}/profiles/search`,
      auth,
      validationMiddleware(browseProfilesSchema, 'query'),
      this.controller.searchProfiles,
    );

    // Get single profile
    this.router.get(
      `${this.path}/profiles/:profileId`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      this.controller.getProfile,
    );

    // Update profile (any step)
    this.router.put(
      `${this.path}/profiles/:profileId`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      validationMiddleware(updateProfileSchema, 'body'),
      this.controller.updateProfile,
    );

    // Submit profile for review
    this.router.post(
      `${this.path}/profiles/:profileId/submit`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      this.controller.submitProfile,
    );

    // Delete profile
    this.router.delete(
      `${this.path}/profiles/:profileId`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      this.controller.deleteProfile,
    );

    // Get profile viewers (who viewed my profile)
    this.router.get(
      `${this.path}/profiles/:profileId/viewers`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      validationMiddleware(matrimonialPaginationSchema, 'query'),
      this.controller.getProfileViewers,
    );

    // Toggle hide profile
    this.router.post(
      `${this.path}/profiles/:profileId/toggle-hide`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      this.controller.toggleHideProfile,
    );

    // ─── Shortlist Routes ───────────────────────────

    // Toggle shortlist
    this.router.post(
      `${this.path}/shortlist/:profileId`,
      auth,
      validationMiddleware(profileIdParamSchema, 'params'),
      this.controller.toggleShortlist,
    );

    // Get shortlisted profiles
    this.router.get(
      `${this.path}/shortlist`,
      auth,
      validationMiddleware(matrimonialPaginationSchema, 'query'),
      this.controller.getShortlistedProfiles,
    );

    // ─── Interest Routes ────────────────────────────

    // Send interest
    this.router.post(
      `${this.path}/interests`,
      auth,
      validationMiddleware(sendInterestSchema, 'body'),
      this.controller.sendInterest,
    );

    // Get sent interests (Interest tab)
    this.router.get(
      `${this.path}/interests/sent`,
      auth,
      validationMiddleware(matrimonialPaginationSchema, 'query'),
      this.controller.getSentInterests,
    );

    // Get received requests (Requests tab)
    this.router.get(
      `${this.path}/interests/received`,
      auth,
      validationMiddleware(matrimonialPaginationSchema, 'query'),
      this.controller.getReceivedRequests,
    );

    // Get accepted/view profiles (View Profile tab)
    this.router.get(
      `${this.path}/interests/accepted`,
      auth,
      validationMiddleware(matrimonialPaginationSchema, 'query'),
      this.controller.getViewProfiles,
    );

    // Respond to interest (accept/reject)
    this.router.put(
      `${this.path}/interests/:interestId/respond`,
      auth,
      validationMiddleware(interestIdParamSchema, 'params'),
      validationMiddleware(respondInterestSchema, 'body'),
      this.controller.respondToInterest,
    );

    // Withdraw interest
    this.router.delete(
      `${this.path}/interests/:interestId`,
      auth,
      validationMiddleware(interestIdParamSchema, 'params'),
      this.controller.withdrawInterest,
    );
  }
}

export default MatrimonialRoute;
