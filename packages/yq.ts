import { Software } from '../api/package_types.ts';
import { brewFormula } from '../managers/brew.ts';
import { snapPackage } from '../managers/snap.ts';

export const YqSoftware: Software = {
  id: 'yq',
  name: 'yq',
  sources: [
    brewFormula({ formula: 'yq', platform: ['linux', 'darwin'] }),
    snapPackage({ packageName: 'yq' }),
    // TODO(stabai): Add other install sources: https://github.com/mikefarah/yq#install
  ],
};
