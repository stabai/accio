import { Software } from '../repository/framework.ts';

export const BuildEssentialsSoftware: Software = {
  id: 'build_essentials',
  name: 'Build Essentials',
  commandLineTools: ['gcc'],
  sources: [
    {
      type: 'eopkg',
      managed: true,
      platform: ['linux'],
      component: true,
      packageName: 'system.devel',
    },
    {
      type: 'apt',
      managed: true,
      platform: ['linux'],
      packageName: 'build-essentials',
    },
  ],
};
