import { Software } from '../repository/framework.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const TarSoftware: Software = {
  id: 'tar',
  name: 'Tar',
  commandLineTools: ['tar'],
  sources: [
    eoPackage({ packageName: 'tar' }),
    aptPackage({ packageName: 'tar' }),
    brewFormula({
      platform: ['linux', 'darwin'],
      formula: 'gnu-tar',
    }),
  ],
};
