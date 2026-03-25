import { APP } from '@/models/mongoose/interfaces/version.model.interface';

export const versions = [
  {
    version: '8.0.0',
    deploymentDate: new Date(),
    releaseDate: new Date(),
    isActive: true,
    app: APP.USER,
  },
  {
    version: '5.0.0',
    deploymentDate: new Date(),
    releaseDate: new Date(),
    isActive: true,
    app: APP.ADMIN,
  },
];

export const defaultPasswords = {
  current: 'hhlapp2024',
  '2020-2024': 'hhlapp2020',
};
