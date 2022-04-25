import { Software } from '../api/package_types.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { snapPackage } from '../managers/snap.ts';

export const NodeSoftware: Software = {
  id: 'node',
  name: 'Node',
  sources: [
    eoPackage({ packageName: 'node' }),
    snapPackage({ packageName: 'node' }),
    brewFormula({ formula: 'node', platform: ['linux', 'darwin'] }),
    // TODO(stabai): Add other install sources: https://nodejs.org/en/download/package-manager/
  ],
};
