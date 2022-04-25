import { Software } from '../api/package_types.ts';
import { brewFormula } from '../managers/brew.ts';
import { remoteInstallScript } from '../managers/script.ts';
import { snapPackage } from '../managers/snap.ts';

export const DenoSoftware: Software = {
  id: 'deno',
  name: 'Deno',
  sources: [
    brewFormula({ platform: ['linux', 'darwin'], formula: 'deno' }),
    snapPackage({ packageName: 'deno' }),
    remoteInstallScript({
      platform: ['linux', 'darwin'],
      requiresRoot: false,
      scriptUrl: 'https://deno.land/x/install/install.sh',
    }),
    // TODO(stabai): Add other install sources: https://deno.land/#installation
  ],
};
