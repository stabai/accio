import { assertExhaustive } from '../api/util_types.ts';
import { BrewCask, BrewFormula, BrewPackage } from '../repository/content.ts';
import { PackageManager } from '../repository/framework.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, tryRunPiped } from '../shell/run.ts';
import { multiInstaller } from './index.ts';

export function brewFormula(params: Omit<BrewFormula, 'type' | 'subType' | 'managed'>): BrewFormula {
  return {
    type: 'brew',
    subType: 'formula',
    managed: true,
    ...params,
  };
}
export function brewCask(params: Omit<BrewCask, 'type' | 'subType' | 'managed' | 'platform'>): BrewCask {
  return {
    type: 'brew',
    subType: 'cask',
    managed: true,
    platform: ['darwin'],
    ...params,
  };
}

export const BrewPackageManager: PackageManager<BrewPackage> = {
  name: 'apt',
  getStatus: async () => {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('apt')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  },
  isPackageInstalled: async (pkg) => {
    const subType = pkg.subType;
    switch (subType) {
      case 'formula':
        return await tryRunPiped(['brew', 'ls', '--formula', pkg.formula]);
      case 'cask':
        return await tryRunPiped(['brew', 'ls', '--cask', pkg.cask]);
      default:
        return assertExhaustive(subType);
    }
  },
  ...multiInstaller(async (...pkgs: BrewPackage[]) => {
    const formulaNames = new Array<string>();
    const caskNames = new Array<string>();
    for (const pkg of pkgs) {
      const subType = pkg.subType;
      switch (subType) {
        case 'formula':
          formulaNames.push(pkg.formula);
          break;
        case 'cask':
          caskNames.push(pkg.cask);
          break;
        default:
          assertExhaustive(subType);
          break;
      }
    }
    if (formulaNames.length > 0) {
      await run(['brew', 'install', '--formula', ...formulaNames]);
    }
    if (caskNames.length > 0) {
      await run(['brew', 'install', '--cask', ...caskNames]);
    }
  }),
  // installPackage: (pkg) => installer([pkg]),
  // installPackages: installer,
};

export default {
  softwarePackages: [],
  packageManagers: [BrewPackageManager],
};
