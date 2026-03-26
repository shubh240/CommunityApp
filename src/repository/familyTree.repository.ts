import type { Request } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import { FAMILY_TREE_MESSAGES } from '@/messages/familyTree.messages';
import FamilyMember from '@/models/mongoose/familyMember.model';
import User from '@/models/mongoose/user.model';

export default class FamilyTreeRepo {
  constructor() {}

  // ─── Add Family Member ──────────────────────────────
  readonly addMember = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const { relation, firstName, lastName, dateOfBirth, profileImage, mobile } = req.body;

    // Only one SELF allowed per user
    if (relation === 'SELF') {
      const selfExists = await FamilyMember.exists({ headUserId, relation: 'SELF' });
      if (selfExists) throw new HttpException(400, FAMILY_TREE_MESSAGES.SELF_ALREADY_EXISTS);
    }

    // Check if member with same mobile is a registered user
    let linkedUserId = null;
    let isRegistered = false;
    if (mobile) {
      const registeredUser = await User.findOne({ mobile, isActive: true }).select('_id');
      if (registeredUser) {
        linkedUserId = registeredUser._id;
        isRegistered = true;
      }
    }

    const member = await FamilyMember.create({
      headUserId,
      userId: linkedUserId,
      relation,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      profileImage,
      mobile,
      isRegistered,
    });

    return member;
  };

  // ─── Update Family Member ───────────────────────────
  readonly updateMember = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const { memberId } = req.params;
    const { relation, firstName, lastName, dateOfBirth, profileImage, mobile } = req.body;

    const member = await FamilyMember.findOne({ _id: memberId, headUserId });
    if (!member) throw new HttpException(404, FAMILY_TREE_MESSAGES.MEMBER_NOT_FOUND);

    // If changing to SELF, check no other SELF exists
    if (relation === 'SELF' && member.relation !== 'SELF') {
      const selfExists = await FamilyMember.exists({ headUserId, relation: 'SELF' });
      if (selfExists) throw new HttpException(400, FAMILY_TREE_MESSAGES.SELF_ALREADY_EXISTS);
    }

    if (relation !== undefined) member.relation = relation;
    if (firstName !== undefined) member.firstName = firstName;
    if (lastName !== undefined) member.lastName = lastName;
    if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) member.profileImage = profileImage;
    if (mobile !== undefined) {
      member.mobile = mobile;
      // Re-check if mobile matches a registered user
      if (mobile) {
        const registeredUser = await User.findOne({ mobile, isActive: true }).select('_id');
        if (registeredUser) {
          member.userId = registeredUser._id;
          member.isRegistered = true;
        } else {
          member.userId = null as any;
          member.isRegistered = false;
        }
      }
    }

    await member.save();
    return member;
  };

  // ─── Delete Family Member ───────────────────────────
  readonly deleteMember = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const { memberId } = req.params;

    const member = await FamilyMember.findOne({ _id: memberId, headUserId });
    if (!member) throw new HttpException(404, FAMILY_TREE_MESSAGES.MEMBER_NOT_FOUND);

    await FamilyMember.deleteOne({ _id: memberId });

    return { memberId };
  };

  // ─── Get My Family Members (list) ───────────────────
  readonly getMyFamily = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const relationFilter = req.query.relation as string;

    const filter: any = { headUserId };
    if (relationFilter) filter.relation = relationFilter;

    const total = await FamilyMember.countDocuments(filter);
    const members = await FamilyMember.find(filter)
      .sort({ relation: 1, createdAt: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'firstName lastName profileImage mobile')
      .lean();

    return {
      members,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  };

  // ─── Get Family Tree (grouped by relation) ─────────
  // Returns members organized in a tree-like structure
  readonly getFamilyTree = async (req: Request) => {
    const headUserId = req.userTokenData._id;

    const members = await FamilyMember.find({ headUserId })
      .sort({ createdAt: 1 })
      .populate('userId', 'firstName lastName profileImage mobile')
      .lean();

    // Group by relation type
    const tree: Record<string, any[]> = {};
    const relationOrder = [
      'SELF', 'FATHER', 'MOTHER', 'GRANDFATHER', 'GRANDMOTHER',
      'SPOUSE', 'BROTHER', 'SISTER', 'SON', 'DAUGHTER',
      'UNCLE', 'AUNT', 'COUSIN', 'OTHER',
    ];

    relationOrder.forEach(relation => {
      const filtered = members.filter(m => m.relation === relation);
      if (filtered.length > 0) {
        tree[relation] = filtered;
      }
    });

    return {
      tree,
      totalMembers: members.length,
    };
  };

  // ─── Get Single Member ──────────────────────────────
  readonly getMember = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const { memberId } = req.params;

    const member = await FamilyMember.findOne({ _id: memberId, headUserId })
      .populate('userId', 'firstName lastName profileImage mobile')
      .lean();

    if (!member) throw new HttpException(404, FAMILY_TREE_MESSAGES.MEMBER_NOT_FOUND);

    return member;
  };

  // ─── Link Member to Registered User ─────────────────
  // Manually link a family member to a registered user's account
  readonly linkMember = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const { memberId } = req.params;
    const { userId } = req.body;

    const member = await FamilyMember.findOne({ _id: memberId, headUserId });
    if (!member) throw new HttpException(404, FAMILY_TREE_MESSAGES.MEMBER_NOT_FOUND);

    const user = await User.findById(userId);
    if (!user) throw new HttpException(404, 'User not found');

    member.userId = user._id;
    member.isRegistered = true;
    await member.save();

    return member;
  };

  // ─── Unlink Member ──────────────────────────────────
  readonly unlinkMember = async (req: Request) => {
    const headUserId = req.userTokenData._id;
    const { memberId } = req.params;

    const member = await FamilyMember.findOne({ _id: memberId, headUserId });
    if (!member) throw new HttpException(404, FAMILY_TREE_MESSAGES.MEMBER_NOT_FOUND);

    member.userId = null as any;
    member.isRegistered = false;
    await member.save();

    return member;
  };
}
