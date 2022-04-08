import {
  MultiInstallPackageManager,
  PackageManagerStatus,
  SimpleManagedPackage,
  Software,
} from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, runPiped, tryRunPiped } from '../shell/run.ts';
import { aptPackage } from './apt.ts';
import { eoPackage } from './eopkg.ts';

export const SnapSoftware: Software = {
  id: 'snap',
  name: 'Snap Package Manager',
  sources: [
    eoPackage({
      packageName: 'snapd',
      manualPostInstallStep: 'reboot',
    }),
    aptPackage({
      packageName: 'snapd',
      manualPostInstallStep: 'logout',
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

export type SnapPackage = SimpleManagedPackage<'snap'>;

export function snapPackage(params: Omit<SnapPackage, 'type' | 'platform' | 'managed'>): SnapPackage {
  return {
    type: 'snap',
    platform: ['linux'],
    managed: true,
    ...params,
  };
}

export class SnapPackageManager extends MultiInstallPackageManager<'snap', SnapPackage> {
  override readonly name = 'snap';
  override readonly installPackageManager = SnapSoftware;

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('snap')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  }

  override isPackageInstalled(pkg: SnapPackage): Promise<boolean> {
    return tryRunPiped(['snap', 'list', pkg.packageName]);
  }

  override async installPackages(...pkgs: SnapPackage[]): Promise<void> {
    const pkgNames = pkgs.map((pkg) => pkg.packageName);
    await runPiped(['snap', 'install', ...pkgNames]);
  }
}
