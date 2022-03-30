import { SoftwarePackage } from "../api/package_types.ts";

export const CurlPackage: SoftwarePackage = {
  name: 'Curl',
  commandLineTools: ['curl'],
  sources: [
    {
      type: 'eopkg',
      platform: ['linux'],
      packageName: 'curl',
    },
    {
      type: 'apt',
      platform: ['linux'],
      packageName: 'curl',
    },
    {
      type: 'brew',
      subType: 'formula',
      platform: ['linux', 'darwin'],
      formula: 'curl',
    },
  ],
}
