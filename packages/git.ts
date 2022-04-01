import { Software } from '../repository/framework.ts';

export const GitSoftware: Software = {
  id: 'git',
  name: 'Git',
  commandLineTools: ['git'],
  sources: [
    {
      type: 'eopkg',
      managed: true,
      platform: ['linux'],
      packageName: 'git',
    },
    {
      type: 'apt',
      managed: true,
      platform: ['linux'],
      packageName: 'git',
    },
    {
      type: 'brew',
      subType: 'formula',
      managed: true,
      platform: ['linux', 'darwin'],
      formula: 'git',
    },
  ],
};
