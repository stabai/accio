import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';

export const JqSoftware: Software = {
  id: 'jq',
  name: 'jq',
  sources: [
    aptPackage({ packageName: 'jq' }),
    brewFormula({ formula: 'jq', platform: ['linux', 'darwin'] }),
    // TODO(stabai): Add other install sources: https://docs.buf.build/installation
  ],
};
