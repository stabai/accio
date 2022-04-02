import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { Software } from '../repository/framework.ts';

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
