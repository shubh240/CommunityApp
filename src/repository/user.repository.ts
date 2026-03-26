import UserMongo from '@/models/mongoose/user.model';
import { HttpException } from '@/exceptions/HttpException';
import { USER_MESSAGES } from '@/messages/user.messages';
import type { Request } from 'express';
import UserDoc from '@/models/mongoose/userDoc.model';
import User from '@/models/mongoose/user.model';
import { DOC_FLOW, DOCUMENT_MESSAGE_MAP } from '@/constants/userDocMap';

export default class UserRepo {
  constructor() {}

  readonly completeProfile = async (req: Request) => {
    const userId = req.userTokenData?._id;
    const { firstName, lastName, email, language } = req.body;
    const user = await UserMongo.findById(userId);
    if (!user) {
      throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
    }

    if (user.onboardingStep !== 1) {
      throw new HttpException(400, USER_MESSAGES.PROFILE_ALREADY_COMPLETED);
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.language = language ?? user.language;

    user.onboardingStep = 2;
    user.kycStatus = 'IN_PROGRESS';

    await user.save();

    return {
      onboardingStep: user.onboardingStep,
      kycStatus: user.kycStatus,
    };
  };

  readonly uploadAddressProof = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { documentName, frontImage, backImage } = req.body;

    // upsert address proof
    await UserDoc.findOneAndUpdate(
      { userId, type: 'ADDRESS_PROOF' },
      {
        documentName,
        frontImage,
        backImage,
        status: 'PENDING',
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // move user onboarding step
    const user = await User.findByIdAndUpdate(userId, {
      onboardingStep: 3,
      kycStatus: 'IN_PROGRESS'
    },
    { new: true, runValidators: true }
    );

    return {
      message: USER_MESSAGES.ADDRESS_PROOF_UPLOADED,
      user,
    };
  };

  readonly uploadUserDocument = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { type, documentName, frontImage, backImage } = req.body;

    if (!DOC_FLOW[type]) {
      throw new HttpException(400, USER_MESSAGES.INVALID_DOCUMENT_TYPE);
    }

    const { nextStep, isLastStep } = DOC_FLOW[type];

    // upsert doc
    await UserDoc.findOneAndUpdate(
      { userId, type },
      {
        documentName,
        frontImage,
        backImage,
        status: 'PENDING',
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // update user onboarding
    const user = await User.findByIdAndUpdate(
      userId,
      {
        onboardingStep: nextStep,
        kycStatus: isLastStep ? 'UNDER_REVIEW' : 'IN_PROGRESS',
      },
      { new: true }
    );

    return {
      message: DOCUMENT_MESSAGE_MAP[type],
      user,
    };
  };

  readonly getMe = async (req: Request) => {
    const userId = req.userTokenData._id;

    const user = await User.findById(userId)
      .select('_id firstName lastName mobile email profileImage onboardingStep kycStatus isBlocked')
      .lean();

    if (!user) throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);

    // Build navigation screen
    const screenMap: Record<string, string> = {
      NOT_STARTED: 'PERSONAL_INFO',
      IN_PROGRESS: ['PERSONAL_INFO', 'ADDRESS_PROOF', 'EDUCATION_PROOF', 'OTHER_DOC', 'UNDER_REVIEW'][user.onboardingStep - 1] ?? 'PERSONAL_INFO',
      UNDER_REVIEW: 'UNDER_REVIEW',
      APPROVED: 'HOME',
      REJECTED: 'REJECTED',
    };

    let rejectedDocs: any[] = [];
    if (user.kycStatus === 'REJECTED') {
      rejectedDocs = await UserDoc.find({ userId, isActive: true })
        .select('type documentName status rejectionReason')
        .lean();
    }

    return {
      user,
      navigation: {
        screen: screenMap[user.kycStatus] ?? 'PERSONAL_INFO',
        ...(rejectedDocs.length > 0 && { rejectedDocs }),
      },
    };
  };

  readonly reUploadUserDocument = async (req: Request) => {
    const userId = req.userTokenData._id;
    const { type, documentName, frontImage, backImage } = req.body;

    if (!DOC_FLOW[type]) {
      throw new HttpException(400, USER_MESSAGES.INVALID_DOCUMENT_TYPE);
    }

    // Only allowed when user is REJECTED
    const user = await User.findById(userId);
    if (!user) throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
    if (user.kycStatus !== 'REJECTED') {
      throw new HttpException(400, USER_MESSAGES.REUPLOAD_NOT_ALLOWED);
    }

    // Reset only the rejected doc back to PENDING
    await UserDoc.findOneAndUpdate(
      { userId, type },
      {
        documentName,
        frontImage,
        backImage,
        status: 'PENDING',
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Check if any doc is still REJECTED
    const stillRejected = await UserDoc.exists({ userId, status: 'REJECTED', isActive: true });

    // If all re-uploaded, move back to UNDER_REVIEW
    await User.findByIdAndUpdate(userId, {
      kycStatus: stillRejected ? 'REJECTED' : 'UNDER_REVIEW',
    });

    const updatedUser = await User.findById(userId);

    return {
      message: DOCUMENT_MESSAGE_MAP[type],
      user: updatedUser,
    };
  };

}
