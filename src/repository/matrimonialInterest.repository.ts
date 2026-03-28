import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { MATRIMONIAL_MESSAGES } from '@/messages/matrimonial.messages';
import MatrimonialInterest from '@/models/mongoose/matrimonialInterest.model';
import MatrimonialProfile from '@/models/mongoose/matrimonialProfile.model';
import { sendNotification } from '@/helper/pushNotification.helper';

export default class MatrimonialInterestRepo {
  constructor() {}

  // ─── Send Interest ──────────────────────────────────
  readonly sendInterest = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { fromProfileId, toProfileId, message } = req.body;

    // Validate sender's profile belongs to them and is approved
    const fromProfile = await MatrimonialProfile.findOne({
      _id: fromProfileId,
      userId,
      isActive: true,
      status: 'APPROVED',
    });
    if (!fromProfile) throw new HttpException(400, 'Your profile must be approved to send interest');

    // Validate target profile exists and is approved
    const toProfile = await MatrimonialProfile.findOne({
      _id: toProfileId,
      isActive: true,
      status: 'APPROVED',
    });
    if (!toProfile) throw new HttpException(404, MATRIMONIAL_MESSAGES.PROFILE_NOT_FOUND);

    // Can't send interest to own profile
    if (toProfile.userId.toString() === userId.toString()) {
      throw new HttpException(400, MATRIMONIAL_MESSAGES.CANNOT_INTEREST_SELF);
    }

    // Check if interest already exists
    const existing = await MatrimonialInterest.findOne({ fromProfileId, toProfileId });
    if (existing) throw new HttpException(400, MATRIMONIAL_MESSAGES.INTEREST_ALREADY_SENT);

    const interest = await MatrimonialInterest.create({
      fromUserId: userId,
      fromProfileId,
      toUserId: toProfile.userId,
      toProfileId,
      message,
    });

    // Notify target user
    await sendNotification({
      senderId: userId,
      receiverId: toProfile.userId,
      type: 'MATRIMONIAL_INTEREST',
      referenceId: interest._id,
      title: 'New Matrimonial Interest',
      message: `${fromProfile.firstName} ${fromProfile.lastName} sent interest`,
    });

    return interest;
  };

  // ─── Respond to Interest (Accept / Reject) ─────────
  readonly respondToInterest = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { interestId } = req.params;
    const { action } = req.body;

    const interest = await MatrimonialInterest.findOne({
      _id: interestId,
      toUserId: userId,
      status: 'PENDING',
    });
    if (!interest) throw new HttpException(404, MATRIMONIAL_MESSAGES.INTEREST_NOT_FOUND);

    interest.status = action;
    await interest.save();

    // Notify sender
    const notificationType = action === 'ACCEPTED'
      ? 'MATRIMONIAL_INTEREST_ACCEPTED'
      : 'MATRIMONIAL_INTEREST_REJECTED';

    await sendNotification({
      senderId: userId,
      receiverId: interest.fromUserId,
      type: notificationType,
      referenceId: interest._id,
      title: action === 'ACCEPTED' ? 'Interest Accepted' : 'Interest Rejected',
      message: action === 'ACCEPTED'
        ? 'accepted your matrimonial interest'
        : 'declined your matrimonial interest',
    });

    return { status: interest.status };
  };

  // ─── Withdraw Interest ──────────────────────────────
  readonly withdrawInterest = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { interestId } = req.params;

    const interest = await MatrimonialInterest.findOne({
      _id: interestId,
      fromUserId: userId,
      status: 'PENDING',
    });
    if (!interest) throw new HttpException(404, MATRIMONIAL_MESSAGES.INTEREST_NOT_FOUND);

    await MatrimonialInterest.deleteOne({ _id: interest._id });

    return { withdrawn: true };
  };

  // ─── Get Sent Interests (Interest tab) ──────────────
  readonly getSentInterests = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const total = await MatrimonialInterest.countDocuments({ fromUserId: userId });
    const interests = await MatrimonialInterest.find({ fromUserId: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: 'toProfileId',
        select: 'firstName lastName dateOfBirth height education profession currentCity photos',
      })
      .lean();

    return {
      interests,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Received Requests (Requests tab) ───────────
  readonly getReceivedRequests = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const total = await MatrimonialInterest.countDocuments({ toUserId: userId, status: 'PENDING' });
    const requests = await MatrimonialInterest.find({ toUserId: userId, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: 'fromProfileId',
        select: 'firstName lastName dateOfBirth height education profession currentCity photos',
      })
      .lean();

    return {
      requests,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Viewed Profiles (accepted interests both ways) ─
  readonly getViewProfiles = async (req: Request) => {
    const userId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Profiles that have mutual accepted interest (both directions)
    const total = await MatrimonialInterest.countDocuments({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      status: 'ACCEPTED',
    });

    const interests = await MatrimonialInterest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      status: 'ACCEPTED',
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: 'fromProfileId',
        select: 'firstName lastName dateOfBirth height education profession currentCity photos userId',
      })
      .populate({
        path: 'toProfileId',
        select: 'firstName lastName dateOfBirth height education profession currentCity photos userId',
      })
      .lean();

    // Return the other person's profile
    const profiles = interests.map(interest => {
      const isSender = interest.fromUserId.toString() === userId.toString();
      return {
        interest: { _id: interest._id, status: interest.status, message: interest.message },
        profile: isSender ? interest.toProfileId : interest.fromProfileId,
      };
    });

    return {
      profiles,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };
}
