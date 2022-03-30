import { SoftwarePackage } from "../api/package_types.ts";

export const WgetPackage: SoftwarePackage = {
  name: 'Wget',
  commandLineTools: ['wget'],
  sources: [
    {
      type: 'eopkg',
      platform: ['linux'],
      packageName: 'wget',
    },
    {
      type: 'apt',
      platform: ['linux'],
      packageName: 'wget',
    },
    {
      type: 'brew',
      subType: 'formula',
      platform: ['linux', 'darwin'],
      formula: 'wget',
    },
  ],
}
