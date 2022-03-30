import { PackageManager, EoPackage } from "../api/package_types.ts";
import { platform } from "../shell/environment.ts";
import { checkCommandAvailable, run, runPiped } from "../shell/run.ts";

const installer = async (pkgs: EoPackage[]) => {
  const pkgNames = pkgs.map(pkg => pkg.packageName);
  await run(['sudo', 'eopkg', 'install', ...pkgNames]);
};

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
  installPackage: (pkg) => installer([pkg]),
  installPackages: installer,
};

export default {
  softwarePackages: [],
  packageManagers: [EoPackageManager],
};
