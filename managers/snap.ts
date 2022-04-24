import {
  MultiInstallPackageManager,
  PackageManagerStatus,
  SimpleManagedPackage,
  Software,
} from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, runSudo, tryRunPiped } from '../shell/run.ts';
import { aptPackage } from './apt.ts';
import { eoPackage } from './eopkg.ts';

// TODO(stabai): Use MultiInstallPackageManager (or alternative if multi-installs not possible)
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
    //     await runPiped(['systemctl', 'enable', '--now', 'snapd.socket']);
    //     await runPiped(['ln', '-s', '/var/lib/snapd/snap', '/snap']);
    //   },
    //   manualPostInstallStep: 'newDesktopSession',
    // },
  ],
};

export type SnapPackage = SimpleManagedPackage<'snap'>;

type OmitKnownKeys<T> = Omit<T, 'type' | 'platform' | 'managed' | 'requiresRoot'>;

export function snapPackage(params: OmitKnownKeys<SnapPackage>): SnapPackage {
  return {
    type: 'snap',
    platform: ['linux'],
    managed: true,
    requiresRoot: true,
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
    await runSudo(['snap', 'install', ...pkgNames]);
  }
}
