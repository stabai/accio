import { awaitRecord, PromiseRecord } from '../api/util_types.ts';
import { PackageManagers, TarballPackage } from '../repository/content.ts';
import {
  InstallScript,
  InstallSource,
  loadPackageManager,
  ManagedPackage,
  SoftwarePackage,
} from '../repository/framework.ts';
import { checkCommandAvailable } from '../shell/run.ts';
import { AptPackageManager } from './apt.ts';
import { BrewPackageManager } from './brew.ts';
import { EoPackageManager } from './eopkg.ts';
import { SnapPackageManager } from './snap.ts';

export const packageManagers = await getPackageManagers();

export function isManagedSource(src: SoftwarePackage): src is ManagedPackage {
  return src.managed;
}

function scriptInstaller(): Promise<InstallSource<InstallScript>> {
  return Promise.resolve({
    name: 'Script',
    status: 'ready',
    installPackage: function (pkg: InstallScript): Promise<void> {
      switch (pkg.subType) {
        case 'local':
          return pkg.install();
        case 'remote':
          // TODO(stabai)
          // download pkg.scriptUrl
          // set execution bit
          // execute pkg.install
          throw new Error('Remote scripts not implemented.');
      }
    },
  });
}
async function tarballInstaller(): Promise<InstallSource<TarballPackage>> {
  const tarInstalled = await checkCommandAvailable('tar');
  const status = tarInstalled ? 'ready' : 'uninstalled';
  return {
    name: 'Tarball',
    status,
    installPackage: function (pkg: TarballPackage): Promise<void> {
      throw new Error('Function not implemented.');
    },
  };
}

function getPackageManagers(): Promise<PackageManagers> {
  const promises: PromiseRecord<PackageManagers> = {
    script: scriptInstaller(),
    tarball: tarballInstaller(),

    apt: loadPackageManager(AptPackageManager),
    brew: loadPackageManager(BrewPackageManager),
    snap: loadPackageManager(SnapPackageManager),
    eopkg: loadPackageManager(EoPackageManager),
  };
  return awaitRecord(promises);
}

export async function isInstalledWithPackageManager<T extends ManagedPackage>(src: T): Promise<boolean> {
  const mgr = packageManagers[src.type] as InstallSource<T>;
  if (mgr.status !== 'ready' || mgr.isPackageInstalled == null) {
    return false;
  } else {
    const result = await mgr.isPackageInstalled(src);
    return result;
  }
}

interface MultiInstaller<T extends SoftwarePackage> {
  installPackage(pkg: T): Promise<void>;
  installPackages(...pkg: T[]): Promise<void>;
}
export function multiInstaller<T extends SoftwarePackage>(
  installer: (...pkgs: T[]) => Promise<void>,
): MultiInstaller<T> {
  return {
    installPackage: installer,
    installPackages: installer,
  };
}
