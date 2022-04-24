import { Platform } from '../api/environment_types.ts';
import { MultiInstallPackageManager, PackageManagerStatus, SoftwarePackage } from '../api/package_types.ts';
import { assertExhaustive } from '../api/util_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, tryRunPiped } from '../shell/run.ts';

export interface BrewFormula extends SoftwarePackage<'brew'> {
  type: 'brew';
  subType: 'formula';
  managed: true;
  requiresRoot: false;
  platform: Platform[];
  formula: string;
}
export interface BrewCask extends SoftwarePackage<'brew'> {
  type: 'brew';
  subType: 'cask';
  managed: true;
  requiresRoot: false;
  platform: ['darwin'];
  cask: string;
}
export type BrewPackage = (BrewFormula | BrewCask) & {
  platform: Platform[];
};

type KnownFormulaKeys = 'type' | 'subType' | 'managed' | 'requiresRoot';
type KnownCaskKeys = KnownFormulaKeys | 'platform';

type OmitKnownKeys<T, K extends string> = Omit<T, K>;

export function brewFormula(params: OmitKnownKeys<BrewFormula, KnownFormulaKeys>): BrewFormula {
  return {
    type: 'brew',
    subType: 'formula',
    managed: true,
    requiresRoot: false,
    ...params,
  };
}
export function brewCask(params: OmitKnownKeys<BrewCask, KnownCaskKeys>): BrewCask {
  return {
    type: 'brew',
    subType: 'cask',
    managed: true,
    requiresRoot: false,
    platform: ['darwin'],
    ...params,
  };
}

export class BrewPackageManager extends MultiInstallPackageManager<'brew', BrewPackage> {
  override readonly name = 'brew';

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('apt')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  }

  override async isPackageInstalled(pkg: BrewPackage): Promise<boolean> {
    const subType = pkg.subType;
    switch (subType) {
      case 'formula':
        return await tryRunPiped(['brew', 'ls', '--formula', pkg.formula]);
      case 'cask':
        return await tryRunPiped(['brew', 'ls', '--cask', pkg.cask]);
      default:
        return assertExhaustive(subType);
    }
  }

  override async installPackages(...pkgs: BrewPackage[]) {
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
  }
}
