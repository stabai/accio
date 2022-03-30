import { SoftwarePackage } from "../api/package_types.ts";

export const BuildEssentialsPackage: SoftwarePackage = {
  name: 'Build Essentials',
  commandLineTools: ['gcc'],
  sources: [
    {
      type: 'eopkg',
      platform: ['linux'],
      component: true,
      packageName: 'system.devel',
    },
    {
      type: 'apt',
      platform: ['linux'],
      packageName: 'build-essentials',
    },
  ],
}
