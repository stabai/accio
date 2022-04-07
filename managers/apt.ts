import { MultiInstallPackageManager, PackageManagerStatus, SimpleManagedPackage } from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, runPiped } from '../shell/run.ts';

let aptUpdated = false;

export type AptPackage = SimpleManagedPackage<'apt'>;

export function aptPackage(params: Omit<AptPackage, 'type' | 'platform' | 'managed'>): AptPackage {
  return {
    type: 'apt',
    platform: ['linux'],
    managed: true,
    ...params,
  };
}

export class AptPackageManager extends MultiInstallPackageManager<'apt', AptPackage> {
  override readonly name = 'apt';

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('apt')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  }

  override async installPackages(...pkgs: AptPackage[]): Promise<void> {
    if (!aptUpdated) {
      aptUpdated = true;
      await run(['sudo', 'apt', 'update']);
    }
    const pkgNames = pkgs.map((pkg) => pkg.packageName);
    await run(['sudo', 'apt', 'install', ...pkgNames]);
  }

  override async isPackageInstalled(pkg: AptPackage): Promise<boolean | undefined> {
    try {
      const result = await runPiped(['apt', '--installed', 'list', pkg.packageName]);
      const outputPrefix = pkg.packageName + '/';
      for (const line of result.stdout.split(platform.eol)) {
        if (line.startsWith(outputPrefix)) {
          return true;
        }
      }
    } catch (_) {
      // This is not fatal, just return undefined to indicate installation could not be verified.
      return undefined;
    }
    return false;
  }
}
