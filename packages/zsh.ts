import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const ZshSoftware: Software = {
  id: 'zsh',
  name: 'Zsh',
  commandLineTools: ['zsh'],
  sources: [
    eoPackage({ packageName: 'zsh', manualPostInstallStep: 'logout' }),
    aptPackage({ packageName: 'zsh', manualPostInstallStep: 'logout' }),
    brewFormula({
      platform: ['linux', 'darwin'],
      formula: 'zsh',
      manualPostInstallStep: 'logout',
    }),
  ],
};
