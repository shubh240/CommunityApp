import UserDoc from "@/models/mongoose/userDoc.model";

const DOC_ORDER = [
  'ADDRESS_PROOF',
  'EDUCATION_PROOF',
  'OTHER',
];

const DOC_STEP_MAP = {
  ADDRESS_PROOF: 2,
  EDUCATION_PROOF: 3,
  OTHER: 4,
};

export const getUserOnboardingStep = async (userId: string) => {
  for (const type of DOC_ORDER) {
    const doc = await UserDoc.findOne({
      userId,
      type,
      status: 'APPROVED',
      isActive: true,
    });

    if (!doc) {
      return DOC_STEP_MAP[type];
    }
  }

  return 6;
};
