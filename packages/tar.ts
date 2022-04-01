import { Software } from '../repository/framework.ts';

export const TarSoftware: Software = {
  id: 'tar',
  name: 'Tar',
  commandLineTools: ['tar'],
  sources: [
    {
      type: 'eopkg',
      managed: true,
      platform: ['linux'],
      packageName: 'tar',
    },
    {
      type: 'apt',
      managed: true,
      platform: ['linux'],
      packageName: 'tar',
    },
    {
      type: 'brew',
      subType: 'formula',
      managed: true,
      platform: ['linux', 'darwin'],
      formula: 'gnu-tar',
    },
  ],
};
