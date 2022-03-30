import { PackageManager, AptPackage } from "../api/package_types.ts";
import { platform } from "../shell/environment.ts";
import { checkCommandAvailable, run, runPiped } from "../shell/run.ts";

let aptUpdated = false;

const installer = async (pkgs: AptPackage[]) => {
  if (!aptUpdated) {
    aptUpdated = true;
    await run(['sudo', 'apt', 'update']);
  }
  const pkgNames = pkgs.map(pkg => pkg.packageName);
  await run(['sudo', 'apt', 'install', ...pkgNames]);
};

export const AptPackageManager: PackageManager<AptPackage> = {
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
  installPackage: (pkg) => installer([pkg]),
  installPackages: installer,
};

export default {
  softwarePackages: [],
  packageManagers: [AptPackageManager],
};
