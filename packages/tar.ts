import { SoftwarePackage } from "../api/package_types.ts";

export const TarPackage: SoftwarePackage = {
  name: 'Tar',
  commandLineTools: ['tar'],
  sources: [
    {
      type: 'eopkg',
      platform: ['linux'],
      packageName: 'tar',
    },
    {
      type: 'apt',
      platform: ['linux'],
      packageName: 'tar',
    },
    {
      type: 'brew',
      subType: 'formula',
      platform: ['linux', 'darwin'],
      formula: 'gnu-tar',
    },
  ],
}
