import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const BuildEssentialsSoftware: Software = {
  id: 'build_essentials',
  name: 'Build Essentials',
  commandLineTools: ['gcc'],
  sources: [
    eoPackage({
      component: true,
      packageName: 'system.devel',
    }),
    aptPackage({ packageName: 'build-essentials' }),
  ],
};
