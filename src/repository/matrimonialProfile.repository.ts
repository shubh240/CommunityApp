import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { MATRIMONIAL_MESSAGES } from '@/messages/matrimonial.messages';
import MatrimonialProfile from '@/models/mongoose/matrimonialProfile.model';
import FamilyMember from '@/models/mongoose/familyMember.model';
import Block from '@/models/mongoose/block.model';
import BlockRepo from '@/repository/block.repository';
import MatrimonialShortlist from '@/models/mongoose/matrimonialShortlist.model';
import MatrimonialProfileView from '@/models/mongoose/matrimonialProfileView.model';

export default class MatrimonialProfileRepo {
  constructor() {}

  // ─── Create Profile (Step 1 - Basic Details) ────────
  readonly createProfile = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { createdForUserId, firstName, lastName, dateOfBirth, height, maritalStatus } = req.body;

    // Verify family member belongs to this user
    const familyMember = await FamilyMember.findOne({ _id: createdForUserId, headUserId: userId });
    if (!familyMember) throw new HttpException(404, 'Family member not found');

    // Check if profile already exists for this family member
    const existing = await MatrimonialProfile.findOne({
      userId,
      createdForUserId,
      isActive: true,
    });
    if (existing) throw new HttpException(400, MATRIMONIAL_MESSAGES.PROFILE_ALREADY_EXISTS);

    const profile = await MatrimonialProfile.create({
      userId,
      createdForUserId,
      firstName,
      lastName,
      dateOfBirth,
      height: height || null,
      maritalStatus: maritalStatus || null,
      status: 'DRAFT',
    });

    return profile;
  };

  // ─── Update Profile (any step / full update) ────────
  readonly updateProfile = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { profileId } = req.params;

    const profile = await MatrimonialProfile.findOne({ _id: profileId, userId, isActive: true });
    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    // Only allow edits on DRAFT or REJECTED profiles
    if (profile.status !== 'DRAFT' && profile.status !== 'REJECTED') {
      throw new HttpException(400, 'Profile can only be edited in DRAFT or REJECTED status');
    }

    const fields = [
      'firstName', 'lastName', 'dateOfBirth', 'height', 'maritalStatus',
      'subCaste', 'gotra', 'nativePlace', 'currentCity',
      'fatherName', 'motherName', 'familyType',
      'education', 'profession', 'company', 'annualIncome',
      'photos', 'aboutCandidate', 'partnerPreferences',
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        (profile as any)[field] = req.body[field];
      }
    });

    // If was rejected, reset back to draft on edit
    if (profile.status === 'REJECTED') {
      profile.status = 'DRAFT';
      profile.rejectionReason = '';
    }

    await profile.save();
    return profile;
  };

  // ─── Submit Profile for Review ──────────────────────
  readonly submitProfile = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { profileId } = req.params;

    const profile = await MatrimonialProfile.findOne({ _id: profileId, userId, isActive: true });
    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    if (profile.status !== 'DRAFT') {
      throw new HttpException(400, 'Only draft profiles can be submitted');
    }

    // Validate required fields before submission
    if (!profile.firstName || !profile.lastName || !profile.dateOfBirth) {
      throw new HttpException(400, 'Please complete basic details before submitting');
    }

    profile.status = 'UNDER_REVIEW';
    await profile.save();

    return profile;
  };

  // ─── Delete Profile ─────────────────────────────────
  readonly deleteProfile = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { profileId } = req.params;

    const profile = await MatrimonialProfile.findOne({ _id: profileId, userId, isActive: true });
    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    profile.isActive = false;
    await profile.save();

    return { profileId };
  };

  // ─── Get My Profiles ───────────────────────────────
  readonly getMyProfiles = async (req: Request) => {
    const userId = req.userTokenData._id;

    const profiles = await MatrimonialProfile.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('createdForUserId', 'firstName lastName relation profileImage')
      .lean();

    return { profiles };
  };

  // ─── Get Single Profile ────────────────────────────
  readonly getProfile = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { profileId } = req.params;

    const profile = await MatrimonialProfile.findOne({ _id: profileId, isActive: true })
      .populate('createdForUserId', 'firstName lastName relation profileImage')
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    // Check block
    const profileOwnerId = profile.userId && (profile.userId as any)._id
      ? (profile.userId as any)._id.toString()
      : null;

    if (profileOwnerId && profileOwnerId !== userId.toString()) {
      const isBlocked = await Block.exists({
        $or: [
          { blockerId: userId, blockedId: profileOwnerId },
          { blockerId: profileOwnerId, blockedId: userId },
        ],
      });
      if (isBlocked) throw new HttpException(403, 'Cannot view this profile');

      // Record profile view (only for other users viewing, not self)
      await MatrimonialProfileView.updateOne(
        { viewerId: userId, profileId },
        { viewerId: userId, profileId },
        { upsert: true }
      );
    }

    // Get view count
    const viewCount = await MatrimonialProfileView.countDocuments({ profileId });

    return { ...profile, viewCount };
  };

  // ─── Browse Approved Profiles ──────────────────────
  readonly browseProfiles = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Get blocked users
    const blockedIds = await BlockRepo.getBlockedIds(userId);

    const filter: any = {
      status: 'APPROVED',
      isActive: true,
      userId: { $ne: userId, $nin: blockedIds }, // exclude own + blocked
    };

    // Apply filters
    const { ageMin, ageMax, heightMin, heightMax, maritalStatus, education, city, q } = req.query;

    if (ageMin || ageMax) {
      const now = new Date();
      if (ageMax) {
        filter.dateOfBirth = { ...filter.dateOfBirth, $gte: new Date(now.getFullYear() - Number(ageMax), now.getMonth(), now.getDate()) };
      }
      if (ageMin) {
        filter.dateOfBirth = { ...filter.dateOfBirth, $lte: new Date(now.getFullYear() - Number(ageMin), now.getMonth(), now.getDate()) };
      }
    }
    if (heightMin) filter.height = { ...filter.height, $gte: Number(heightMin) };
    if (heightMax) filter.height = { ...filter.height, $lte: Number(heightMax) };
    if (maritalStatus) filter.maritalStatus = maritalStatus;
    if (education) filter.education = { $regex: education, $options: 'i' };
    if (city) filter.currentCity = { $regex: city, $options: 'i' };
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await MatrimonialProfile.countDocuments(filter);
    const profiles = await MatrimonialProfile.find(filter)
      .select('firstName lastName dateOfBirth height maritalStatus education profession company currentCity photos userId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'firstName lastName profileImage')
      .lean();

    return {
      profiles,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Search Profiles ───────────────────────────────
  readonly searchProfiles = async (req: Request) => {
    // Same as browseProfiles but dedicated for search tab
    return this.browseProfiles(req);
  };

  // ─── Toggle Shortlist / Favourite ───────────────────
  readonly toggleShortlist = async (req: Request) => {
    const userId = req.userTokenData._id;
    const profileId = req.params.profileId as string;

    const profile = await MatrimonialProfile.findOne({ _id: profileId, isActive: true, status: 'APPROVED' });
    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    if (profile.userId.toString() === userId.toString()) {
      throw new HttpException(400, 'Cannot shortlist your own profile');
    }

    const existing = await MatrimonialShortlist.findOne({ userId, profileId });

    if (existing) {
      await MatrimonialShortlist.deleteOne({ _id: existing._id });
      return { shortlisted: false };
    } else {
      await MatrimonialShortlist.create({ userId, profileId });
      return { shortlisted: true };
    }
  };

  // ─── Get Shortlisted Profiles ──────────────────────
  readonly getShortlistedProfiles = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const total = await MatrimonialShortlist.countDocuments({ userId });
    const shortlisted = await MatrimonialShortlist.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: 'profileId',
        match: { isActive: true, status: 'APPROVED' },
        select: 'firstName lastName dateOfBirth height maritalStatus education profession currentCity photos userId',
        populate: { path: 'userId', select: 'firstName lastName profileImage' },
      })
      .lean();

    const profiles = shortlisted.filter(s => s.profileId !== null);

    return {
      profiles: profiles.map(s => ({ ...s.profileId as any, shortlistedAt: (s as any).createdAt })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Toggle Hide Profile ───────────────────────────
  // Temporarily hide profile from browse without deleting
  readonly toggleHideProfile = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { profileId } = req.params;

    const profile = await MatrimonialProfile.findOne({ _id: profileId, userId });
    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    profile.isActive = !profile.isActive;
    await profile.save();

    return { hidden: !profile.isActive, isActive: profile.isActive };
  };

  // ─── Get Profile Viewers ───────────────────────────
  // Who viewed my matrimonial profile
  readonly getProfileViewers = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { profileId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    // Verify profile belongs to this user
    const profile = await MatrimonialProfile.findOne({ _id: profileId, userId });
    if (!profile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    const total = await MatrimonialProfileView.countDocuments({ profileId });
    const viewers = await MatrimonialProfileView.find({ profileId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('viewerId', 'firstName lastName profileImage')
      .lean();

    return {
      viewers: viewers.map(v => ({ user: v.viewerId, viewedAt: (v as any).updatedAt })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };
}
