//* ***************** specify constant variable ****************(EX. const TEST_USER="test user")

export const errorMessage = {
  'string.base': '{#label} should be a type of text',
  'string.min': '{#label} should have a minimum length of {#limit}',
  'string.empty': '{#label} is not allowed to be empty',
  'string.max': '{#label} should be maximum {#limit} characters..',
  'string.pattern.base': 'Please enter valid {#label}',
  'any.required': '{#label} is a required field',
};

// *************** all file types ************
export const IMAGE_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

export const VIDEO_FILE_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export const AUDIO_FILE_TYPES = ['audio/mp3', 'audio/ogg', 'audio/mpeg'];

export const ATTACHMENT_FILE_TYPES = [
  'audio/mp3',
  'audio/ogg',
  'audio/mpeg',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
];

export const BULK_UPLOAD_FILE_TYPES = ['text/csv'];

// ************* hear we define all filed's name which contain file ***********
export const FILE_FIELD_NAME_OBJ = {
  color_logo: {
    directory: '/images/account/color_logo',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...IMAGE_FILE_TYPES],
  },
  white_logo: {
    directory: '/images/account/white_logo',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...IMAGE_FILE_TYPES],
  },
  contact_csv: {
    directory: '/files/contact/contact_csv',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...BULK_UPLOAD_FILE_TYPES],
  },
  user_csv: {
    directory: '/files/user/user_csv',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...BULK_UPLOAD_FILE_TYPES],
  },
  team_csv: {
    directory: '/files/user/team_csv',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...BULK_UPLOAD_FILE_TYPES],
  },
  template_image: {
    directory: '/images/template/template_image',
    size: 1024 * 1024 * 2, // 2 mb
    fileTypes: [...IMAGE_FILE_TYPES],
  },
};

export enum DEFAULT_ROLES {
  ADMIN = 'admin',
  USER = 'user',
}
