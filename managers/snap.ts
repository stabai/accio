import { SnapPackage, PackageManager, SoftwarePackage } from "../api/package_types.ts";
import { platform } from "../shell/environment.ts";
import { checkCommandAvailable, runPiped, tryRunPiped } from "../shell/run.ts";

export const SnapSoftwarePackage: SoftwarePackage = {
  name: 'Snap Package Manager',
  sources: [
    {
      type: 'eopkg',
      platform: ['linux'],
      packageName: 'snapd',
      manualPostInstallStep: 'reboot',
    },
    {
      type: 'apt',
      platform: ['linux'],
      packageName: 'snapd',
      manualPostInstallStep: 'newDesktopSession',
    },
    // {
    //   type: 'yum',
    //   platform: ['linux'],
    //   packageName: 'snapd',
    //   postInstall: async () => {
    //     await runPiped(['sudo', 'systemctl', 'enable', '--now', 'snapd.socket']);
    //     await runPiped(['sudo', 'ln', '-s', '/var/lib/snapd/snap', '/snap']);
    //   },
    //   manualPostInstallStep: 'newDesktopSession',
    // },
  ],
};

export const SnapPackageManager: PackageManager<SnapPackage> = {
  name: 'snap',
  getStatus: async () => {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('snap')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  },
  isPackageInstalled: (pkg) => {
    return tryRunPiped(['snap', 'list', pkg.packageName]);
  },
  installPackage: async (pkg) => {
    await runPiped(['snap', 'install', pkg.packageName]);
  },
  installPackages: async (pkgs) => {
    const pkgNames = pkgs.map(pkg => pkg.packageName);
    await runPiped(['snap', 'install', ...pkgNames]);
  },
  installPackageManager: SnapSoftwarePackage,
};

export default {
  softwarePackages: [SnapSoftwarePackage],
  packageManagers: [SnapPackageManager],
};
