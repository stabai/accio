import { AptPackage } from '../repository/content.ts';
import { UnloadedPackageManager } from '../repository/framework.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, runPiped } from '../shell/run.ts';
import { multiInstaller } from './index.ts';

let aptUpdated = false;

export function aptPackage(params: Omit<AptPackage, 'type' | 'managed'>): AptPackage {
  return {
    type: 'apt',
    managed: true,
    ...params,
  };
}

export const AptPackageManager: UnloadedPackageManager<AptPackage> = {
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
    try {
      const result = await runPiped(['apt', '--installed', 'list', pkg.packageName]);
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
  ...multiInstaller(async (...pkgs: AptPackage[]) => {
    if (!aptUpdated) {
      aptUpdated = true;
      await run(['sudo', 'apt', 'update']);
    }
    const pkgNames = pkgs.map((pkg) => pkg.packageName);
    await run(['sudo', 'apt', 'install', ...pkgNames]);
  }),
  // installPackage: (pkg: AptPackage) => {
  //   return AptPackageManager.installPackages(pkg);
  // },
  // installPackages: async (...pkgs: AptPackage[]) => {
  //   if (!aptUpdated) {
  //     aptUpdated = true;
  //     await run(['sudo', 'apt', 'update']);
  //   }
  //   const pkgNames = pkgs.map(pkg => pkg.packageName);
  //   await run(['sudo', 'apt', 'install', ...pkgNames]);
  // },
};

export default {
  softwarePackages: [],
  packageManagers: [AptPackageManager],
};
