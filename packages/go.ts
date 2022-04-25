import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { snapPackage } from '../managers/snap.ts';

export const GoSoftware: Software = {
  id: 'go',
  name: 'Go',
  sources: [
    eoPackage({ packageName: 'golang' }),
    snapPackage({ packageName: 'go', useClassicMode: true }),
    brewFormula({ formula: 'go', platform: ['linux', 'darwin'] }),
    // TODO(stabai): Add other install sources (scattered)
  ],
};
