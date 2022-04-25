import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const PythonSoftware: Software = {
  id: 'python',
  name: 'Python',
  sources: [
    aptPackage({ packageName: 'python' }),
    eoPackage({ packageName: 'python' }),
    brewFormula({ formula: 'python', platform: ['linux', 'darwin'] }),
    // TODO(stabai): Add other install sources (scattered)
  ],
};
