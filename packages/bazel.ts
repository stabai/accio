import { Software } from '../api/package_types.ts';
import { brewFormula } from '../managers/brew.ts';

export const BazelSoftware: Software = {
  id: 'bazel',
  name: 'Bazel',
  sources: [
    brewFormula({ platform: ['linux', 'darwin'], formula: 'bazelisk' }),
    // TODO(stabai): Add other install sources: https://bazel.build/install/bazelisk
  ],
};
