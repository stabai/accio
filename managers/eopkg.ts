import { MultiInstallPackageManager, SimpleManagedPackage } from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, runPiped } from '../shell/run.ts';

export interface EoPackage extends SimpleManagedPackage<'eopkg'> {
  component?: boolean;
}

export function eoPackage(params: Omit<EoPackage, 'type' | 'platform' | 'managed'>): EoPackage {
  return {
    type: 'eopkg',
    platform: ['linux'],
    managed: true,
    ...params,
  };
}

export class EoPackageManager extends MultiInstallPackageManager<'eopkg', EoPackage> {
  override readonly name = 'eopkg';

  protected override async checkStatus() {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('eopkg')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  }

  override async isPackageInstalled(pkg: EoPackage): Promise<boolean | undefined> {
    try {
      const result = await runPiped(['eopkg', 'list-installed', '--install-info', pkg.packageName]);
      const outputPrefix = pkg + '/';
      for (const line of result.stdout.split(platform.eol)) {
        if (line.startsWith(outputPrefix)) {
          return true;
        }
      }
    } catch (_) {
      return undefined;
      // This is not fatal, just return undefined to indicate installation could not be verified.
    }
    return false;
  }

  override async installPackages(...pkgs: EoPackage[]): Promise<void> {
    const pkgNames = pkgs.map((pkg) => pkg.packageName);
    await run(['sudo', 'eopkg', 'install', ...pkgNames]);
  }
}
