import { USER_MESSAGES } from "@/messages/user.messages";

export const DOC_FLOW = {
  ADDRESS_PROOF: {
    step: 2,
    nextStep: 3,
    isLastStep: false
  },
  EDUCATION_PROOF: {
    step: 3,
    nextStep: 4,
    isLastStep: false
  },
  OTHER: {
    step: 4,
    nextStep: 5,
    isLastStep: true
  },
};

export const DOCUMENT_MESSAGE_MAP: Record<string, string> = {
  ADDRESS_PROOF: USER_MESSAGES.ADDRESS_PROOF_UPLOADED,
  EDUCATION_PROOF: USER_MESSAGES.EDUCATION_PROOF_UPLOADED,
  OTHER: USER_MESSAGES.OTHER_DOC_UPLOADED,
};
