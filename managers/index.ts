import {
  ALL_PACKAGE_TYPES,
  PackageManager,
  PackageManagerCatalog,
  PackageType,
  Software,
  SoftwarePackage,
  SoftwarePackageChoice,
} from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { AptPackageManager } from './apt.ts';
import { BrewPackageManager } from './brew.ts';
import { EoPackageManager } from './eopkg.ts';
import { ScriptInstaller } from './script.ts';
import { SnapPackageManager } from './snap.ts';
import { TarballInstaller } from './tarball.ts';

const packageManagers: PackageManagerCatalog = {
  script: new ScriptInstaller(),
  tarball: new TarballInstaller(),

  apt: new AptPackageManager(),
  brew: new BrewPackageManager(),
  snap: new SnapPackageManager(),
  eopkg: new EoPackageManager(),
  // TODO(stabai):
  // dpkg: InstallSource<DebPackage>;
  // gem: InstallSource<GemPackage>;
  // go: InstallSource<GoPackage>;
  // flatpak: InstallSource<FlatpakPackage>;
  // macports: InstallSource<MacportsPackage>;
  // pacman: InstallSource<PacmanPackage>;
  // npm: InstallSource<NpmPackage>;
  // rpm: InstallSource<RpmPackage>;
  // yum: InstallSource<YumPackage>;
  // cargo: InstallSource<CargoPackage>;
  // dnf: InstallSource<DnfPackage>;
  // git: InstallSource<GitPackage>;
  // pip: InstallSource<PipPackage>;
  // zypper: InstallSource<ZypperPackage>;
  // If adding Windows:
  // choco: InstallSource<ChocoPackage>;
  // nuget: InstallSource<NuGetPackage>;
  // winget: InstallSource<WinGetPackage>;
};

export const ALL_PACKAGE_MANAGERS: PackageManagerCatalog = await loadPackageManagers(packageManagers);

export function isPackageType(value: string): value is PackageType {
  return (ALL_PACKAGE_TYPES as readonly string[]).includes(value);
}

export function getPackageManager<T extends PackageType>(packageType: T): PackageManager<T> {
  return ALL_PACKAGE_MANAGERS[packageType];
}

async function loadPackageManagers(catalog: PackageManagerCatalog): Promise<PackageManagerCatalog> {
  const promises: Promise<unknown>[] = [];
  for (const packageType of ALL_PACKAGE_TYPES) {
    const mgr = catalog[packageType];
    promises.push(mgr.determineStatus());
  }
  await Promise.allSettled(promises);
  return catalog;
}

export async function isInstalledWithPackageManager<T extends PackageType>(src: SoftwarePackage<T>): Promise<boolean> {
  const mgr = getPackageManager(src.type);
  if (mgr.status !== 'ready' || mgr.isPackageInstalled == null) {
    return false;
  } else {
    const result = await mgr.isPackageInstalled(src);
    return result ?? false;
  }
}

export function supportsMultiInstall<T extends PackageType>(packageType: T): boolean {
  const mgr = getPackageManager(packageType);
  return mgr.installPackages != null;
}

export function supportsPackageCheck<T extends PackageType>(packageType: T): boolean {
  const mgr = getPackageManager(packageType);
  return mgr.isPackageInstalled != null;
}

export function chooseInstallPackage(software: Software): SoftwarePackageChoice {
  let backup: SoftwarePackage | undefined;
  for (const pkg of software.sources) {
    if (!pkg.platform.includes(platform.platform)) {
      continue;
    }
    const mgr = getPackageManager(pkg.type);
    if (mgr.status !== 'ready') {
      continue;
    } else if (pkg.managed && supportsMultiInstall(pkg.type)) {
      return { software, package: pkg };
    } else if (backup == null) {
      backup = pkg;
    }
  }
  return { software, package: backup };
}
