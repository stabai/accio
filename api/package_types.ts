import { Platform } from './environment_types.ts';
import { KeyedSet } from './util_types.ts';

export const ALL_SOFTWARE_IDS = [
  'build_essentials',
  'curl',
  'git',
  'karabiner_elements',
  'snap',
  'tar',
  'wget',
  'zsh',
] as const;

export const MANUAL_PACKAGE_TYPES = [
  'tarball',
  'script',
] as const;

export const MANAGED_PACKAGE_TYPES = [
  'apt',
  'brew',
  'eopkg',
  'snap',
] as const;

export const ALL_PACKAGE_TYPES = [...MANUAL_PACKAGE_TYPES, ...MANAGED_PACKAGE_TYPES] as const;

export type SoftwareId = typeof ALL_SOFTWARE_IDS[number];
export type ManualPackageType = typeof MANUAL_PACKAGE_TYPES[number];
export type ManagedPackageType = typeof MANAGED_PACKAGE_TYPES[number];
export type PackageType = typeof ALL_PACKAGE_TYPES[number];

export const SOFTWARE_FILTERS = ['installable', 'installed', 'uninstalled', 'all'] as const;
export type SoftwareFilter = typeof SOFTWARE_FILTERS[number];

export type PackageManagerStatus = 'ready' | 'uninstalled' | 'unsupported';

export type ManualPostInstallStep = 'new terminal session' | 'logout' | 'reboot';

export abstract class PackageManager<
  T extends PackageType = PackageType,
  P extends SoftwarePackage<T> = SoftwarePackage<T>,
> {
  abstract readonly name: T;
  readonly installPackageManager?: Software;

  private statusInternal?: PackageManagerStatus;
  private statusPromise?: Promise<PackageManagerStatus>;

  get status(): PackageManagerStatus | undefined {
    if (this.statusInternal != null) {
      return this.statusInternal;
    } else {
      this.determineStatus();
      return undefined;
    }
  }

  async determineStatus(): Promise<PackageManagerStatus> {
    if (this.statusPromise == null) {
      this.statusPromise = this.checkStatus();
    }
    this.statusInternal = await this.statusPromise;
    return this.statusInternal;
  }

  protected abstract checkStatus(): Promise<PackageManagerStatus>;
  abstract installPackage(pkg: P): Promise<void>;
  installPackages?(...pkg: P[]): Promise<void>;
  isPackageInstalled?(pkg: P): Promise<boolean | undefined>;
}

export abstract class MultiInstallPackageManager<
  T extends PackageType = PackageType,
  P extends SoftwarePackage<T> = SoftwarePackage<T>,
> extends PackageManager<T, P> {
  installPackage(pkg: P): Promise<void> {
    return this.installPackages(pkg);
  }
  abstract installPackages(...pkgs: P[]): Promise<void>;
}

export interface SimpleManagedPackage<T extends PackageType> extends SoftwarePackage<T> {
  packageName: string;
}

export interface SoftwarePackage<T extends PackageType = PackageType> {
  type: T;
  subType?: string;
  managed: boolean;
  platform: Platform[];
  manualPostInstallStep?: ManualPostInstallStep;
}

export interface Software {
  id: SoftwareId;
  name: string;
  sources: SoftwarePackage<PackageType>[];
  commandLineTools?: string[];
  installStatusChecker?: () => Promise<boolean>;
}

export type PackageManagerCatalog = {
  [P in PackageType]: PackageManager<P, SoftwarePackage<P>>;
};

export type SoftwareCatalog = {
  [P in SoftwareId]: Software;
};

export interface SoftwarePackageChoice {
  software: Software;
  package: SoftwarePackage | undefined;
}

export interface SoftwareTypeGrouping<T extends PackageType = PackageType> {
  name: string;
  type: T;
  source: PackageManager<T>;
  packages: SoftwarePackage<T>[];
}

export type SoftwarePackageGroupings = KeyedSet<string, SoftwareTypeGrouping>;

export function getPackageTypeName(pkg: SoftwarePackage): string {
  if ('subType' in pkg && pkg.subType != null) {
    return [pkg.type, pkg.subType].join(' ');
  } else {
    return pkg.type;
  }
}
