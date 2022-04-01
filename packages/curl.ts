import { Software } from '../repository/framework.ts';

export const CurlSoftware: Software = {
  id: 'curl',
  name: 'Curl',
  commandLineTools: ['curl'],
  sources: [
    {
      type: 'eopkg',
      managed: true,
      platform: ['linux'],
      packageName: 'curl',
    },
    {
      type: 'apt',
      managed: true,
      platform: ['linux'],
      packageName: 'curl',
    },
    {
      type: 'brew',
      subType: 'formula',
      managed: true,
      platform: ['linux', 'darwin'],
      formula: 'curl',
    },
  ],
};
