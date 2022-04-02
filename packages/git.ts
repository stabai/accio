import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { Software } from '../repository/framework.ts';

export const GitSoftware: Software = {
  id: 'git',
  name: 'Git',
  commandLineTools: ['git'],
  sources: [
    eoPackage({ packageName: 'git' }),
    aptPackage({ packageName: 'git' }),
    brewFormula({
      platform: ['linux', 'darwin'],
      formula: 'git',
    }),
  ],
};
