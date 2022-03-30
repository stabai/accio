import { SoftwarePackage } from "../api/package_types.ts";

export const GitPackage: SoftwarePackage = {
  name: 'Git',
  commandLineTools: ['git'],
  sources: [
    {
      type: 'eopkg',
      platform: ['linux'],
      packageName: 'git',
    },
    {
      type: 'apt',
      platform: ['linux'],
      packageName: 'git',
    },
    {
      type: 'brew',
      subType: 'formula',
      platform: ['linux', 'darwin'],
      formula: 'git',
    },
  ],
}
