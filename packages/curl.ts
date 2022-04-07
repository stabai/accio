import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const CurlSoftware: Software = {
  id: 'curl',
  name: 'Curl',
  commandLineTools: ['curl'],
  sources: [
    eoPackage({ packageName: 'curl' }),
    aptPackage({ packageName: 'curl' }),
    brewFormula({
      platform: ['linux', 'darwin'],
      formula: 'curl',
    }),
  ],
};
