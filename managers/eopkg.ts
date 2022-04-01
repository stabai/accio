import { EoPackage } from '../repository/content.ts';
import { PackageManager } from '../repository/framework.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, runPiped } from '../shell/run.ts';
import { multiInstaller } from './index.ts';

export function eoPackage(params: Omit<EoPackage, 'type' | 'managed'>): EoPackage {
  return {
    type: 'eopkg',
    managed: true,
    ...params,
  };
}

export const EoPackageManager: PackageManager<EoPackage> = {
  name: 'eopkg',
  getStatus: async () => {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('eopkg')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  },
  isPackageInstalled: async (pkg) => {
    try {
      const result = await runPiped(['eopkg', 'list-installed', '--install-info', pkg.packageName]);
      const outputPrefix = pkg + '/';
      for (const line of result.stdout.split(platform.eol)) {
        if (line.startsWith(outputPrefix)) {
          return true;
        }
      }
    } catch (_) {
      // Fall through and return false to indicate installation could not be verified.
    }
    return false;
  },
  ...multiInstaller(async (...pkgs: EoPackage[]) => {
    const pkgNames = pkgs.map((pkg) => pkg.packageName);
    await run(['sudo', 'eopkg', 'install', ...pkgNames]);
  }),
};

export default {
  softwarePackages: [],
  packageManagers: [EoPackageManager],
};
