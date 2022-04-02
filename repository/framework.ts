import { Platform } from '../api/environment_types.ts';
import { ManualPostInstallStep, PackageManagerStatus } from '../api/package_types.ts';
import { ManagedPackageTypes, PackageManagers, PackageType, SoftwareId, TarballPackage } from './content.ts';

interface BasePackageManager<T extends ManagedPackage> {
  name: string;
  getStatus: () => Promise<PackageManagerStatus>;
  isPackageInstalled: (pkg: T) => Promise<boolean>;
  installPackageManager?: Software;
  installPackage: (pkg: T) => Promise<void>;
  installPackages?: (...pkgs: T[]) => Promise<void>;
}

export interface UnloadedPackageManager<T extends ManagedPackage> extends BasePackageManager<T> {
  status?: undefined;
}

export interface LoadedPackageManager<T extends ManagedPackage> extends BasePackageManager<T>, InstallSource<T> {
  status: PackageManagerStatus;
  isPackageInstalled: (pkg: T) => Promise<boolean>;
}

export type PackageManager<T extends ManagedPackage> = UnloadedPackageManager<T> | LoadedPackageManager<T>;

export async function loadPackageManager<T extends ManagedPackage>(
  packageManager: PackageManager<T>,
): Promise<LoadedPackageManager<T>> {
  if (packageManager.status != null) {
    return packageManager;
  }
  const loaded = packageManager as unknown as LoadedPackageManager<T>;
  loaded.status = await packageManager.getStatus();
  return loaded;
}

export interface Software {
  id: SoftwareId;
  name: string;
  sources: SoftwarePackage[];
  commandLineTools?: string[];
  installStatusChecker?: () => Promise<boolean>;
}

interface BaseInstallScript<S extends 'local' | 'remote'> extends BasePackageSource {
  type: 'script';
  subType: S;
  managed: false;
  getStatus: () => Promise<PackageManagerStatus>;
}
export interface LocalInstallScript extends BaseInstallScript<'local'> {
  command: string[];
  install: () => Promise<void>;
}
export interface RemoteInstallScript extends BaseInstallScript<'remote'> {
  scriptUrl: string;
  install: (localScriptPath: string) => Promise<void>;
}

export type InstallScript = LocalInstallScript | RemoteInstallScript;

export type SoftwarePackage = ManagedPackage | TarballPackage | InstallScript;

type ManagerOf<T extends PackageType> = {
  [P in T]: PackageManagers[P];
}[T];
// deno-lint-ignore no-explicit-any
type PackageFrom<T extends InstallSource<any>> = T extends InstallSource<infer S> ? S : never;
export type Package<T extends PackageType> = PackageFrom<ManagerOf<T>>;

export interface BasePackageSource {
  type: PackageType;
  managed: boolean;
  platform: Platform[];
  // postInstall?: () => Promise<void>;
  manualPostInstallStep?: ManualPostInstallStep;
}

export interface SoftwarePackageChoice {
  software: Software;
  package: SoftwarePackage | undefined;
}

export function getPackageTypeName(pkg: SoftwarePackage): string {
  if ('subType' in pkg && pkg.subType != null) {
    return [pkg.type, pkg.subType].join(' ');
  } else {
    return pkg.type;
  }
}

export interface GenericPackage<T extends PackageType> extends BasePackageSource {
  type: T;
  subType?: never;
  managed: true;
  packageName: string;
}

export type ManagedPackage = Package<ManagedPackageTypes>;

export interface InstallSource<T extends BasePackageSource> {
  name: string;
  status: PackageManagerStatus;
  isPackageInstalled?: (pkg: T) => Promise<boolean>;
  installPackage: (pkg: T) => Promise<void>;
}

export type SoftwarePackageGroupings = Partial<Record<PackageType, SoftwarePackage[]>>;

export function groupSoftwarePackageChoices(packageChoices: SoftwarePackageChoice[]): SoftwarePackageGroupings {
  const groupings: Partial<Record<PackageType, SoftwarePackage[]>> = {};
  for (const choice of packageChoices) {
    if (choice.package == null) {
      continue;
    }
    let packages = groupings[choice.package.type];
    if (packages == null) {
      packages = [];
      groupings[choice.package.type] = packages;
    }
    packages.push(choice.package);
  }
  return groupings;
}
