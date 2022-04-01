import { SnapPackage } from '../repository/content.ts';
import { PackageManager, Software } from '../repository/framework.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, runPiped, tryRunPiped } from '../shell/run.ts';
import { aptPackage } from './apt.ts';
import { eoPackage } from './eopkg.ts';
import { multiInstaller } from './index.ts';

export const SnapSoftware: Software = {
  id: 'snap',
  name: 'Snap Package Manager',
  sources: [
    eoPackage({
      platform: ['linux'],
      packageName: 'snapd',
      manualPostInstallStep: 'reboot',
    }),
    aptPackage({
      platform: ['linux'],
      packageName: 'snapd',
      manualPostInstallStep: 'newDesktopSession',
    }),
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
  ...multiInstaller(async (...pkgs: SnapPackage[]) => {
    const pkgNames = pkgs.map((pkg) => pkg.packageName);
    await runPiped(['snap', 'install', ...pkgNames]);
  }),
  installPackageManager: SnapSoftware,
};

export default {
  softwarePackages: [SnapSoftware],
  packageManagers: [SnapPackageManager],
};
