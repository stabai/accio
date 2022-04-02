import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { Software } from '../repository/framework.ts';

export const WgetSoftware: Software = {
  id: 'wget',
  name: 'Wget',
  commandLineTools: ['wget'],
  sources: [
    eoPackage({ packageName: 'wget' }),
    aptPackage({ packageName: 'wget' }),
    brewFormula({
      platform: ['linux', 'darwin'],
      formula: 'wget',
    }),
  ],
};
