import { Software } from '../repository/framework.ts';

export const WgetSoftware: Software = {
  id: 'wget',
  name: 'Wget',
  commandLineTools: ['wget'],
  sources: [
    {
      type: 'eopkg',
      managed: true,
      platform: ['linux'],
      packageName: 'wget',
    },
    {
      type: 'apt',
      managed: true,
      platform: ['linux'],
      packageName: 'wget',
    },
    {
      type: 'brew',
      subType: 'formula',
      managed: true,
      platform: ['linux', 'darwin'],
      formula: 'wget',
    },
  ],
};
