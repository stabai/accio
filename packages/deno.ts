import { Software } from '../api/package_types.ts';
import { brewFormula } from '../managers/brew.ts';
import { remoteInstallScript } from '../managers/script.ts';
import { snapPackage } from '../managers/snap.ts';

export const DenoSoftware: Software = {
  id: 'deno',
  name: 'Deno',
  sources: [
    remoteInstallScript({
      platform: ['linux', 'darwin'],
      requiresRoot: false,
      scriptUrl: 'https://deno.land/x/install/install.sh',
    }),
    snapPackage({ packageName: 'deno' }),
    brewFormula({ platform: ['linux', 'darwin'], formula: 'deno' }),
    // TODO(stabai): Add other install sources: https://deno.land/#installation
  ],
};
