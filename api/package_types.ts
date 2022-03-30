import { idify } from "./util_types.ts";

export type Platform = 'linux' | 'darwin' | 'windows';

export interface PlatformInfo {
  platform: Platform;
  homeDir: string;
  downloadDir: string;
  eol: '\n' | '\r\n';
}

export interface SoftwarePackage {
  name: string;
  sources: PackageSource[];
  commandLineTools?: string[];
  installStatusChecker?: () => Promise<boolean>;
}

export type ManualPostInstallStep = 'newTerminalSession' | 'newDesktopSession' | 'reboot';

interface BasePackageSource {
  platform: Platform[];
  postInstall?: () => Promise<void>;
  manualPostInstallStep?: ManualPostInstallStep;
}

// TODO: T should extend PackageType
interface GenericPackage<T extends string, S extends string | undefined = undefined> extends BasePackageSource {
  type: T;
  subType?: S;
  packageName: string;
}
export type AptPackage = GenericPackage<'apt'>;
export type GemPackage = GenericPackage<'gem'>;
export type GoPackage = GenericPackage<'go'>;
export interface EoPackage extends GenericPackage<'eopkg'> {
  component?: boolean;
}
export type FlatpakPackage = GenericPackage<'flatpak'>;
export type MacportsPackage = GenericPackage<'macports'>;
export type PacmanPackage = GenericPackage<'pacman'>;
export type NpmPackage = GenericPackage<'npm'>;
export type SnapPackage = GenericPackage<'snap'>;
export type YumPackage = GenericPackage<'yum'>;
type AnyGenericPackage = AptPackage | GemPackage | GoPackage | EoPackage | FlatpakPackage | MacportsPackage | PacmanPackage | NpmPackage | SnapPackage | YumPackage;

// TODO: T should extend PackageType
interface FilePackage<T extends string, S extends string | undefined = undefined> extends BasePackageSource {
  type: T;
  subType?: S;
  packageUrl: string;
}
export type DebPackage = FilePackage<'dpkg'>;
export type RpmPackage = FilePackage<'rpm'>;
type AnyFilePackage = DebPackage | RpmPackage;

export interface TarballPackage extends BasePackageSource {
  type: 'tarball';
  packageUrl: string;
  installer: (extractedDir: string) => Promise<void>;
}
export interface BrewFormula extends BasePackageSource {
  type: 'brew';
  subType: 'formula';
  platform: Platform[];
  formula: string;
}
export interface BrewCask extends BasePackageSource {
  type: 'brew';
  subType: 'cask';
  platform: ['darwin'];
  cask: string;
}
export type BrewPackage = (BrewFormula | BrewCask);

export interface ThirdPartyEopkg extends BasePackageSource {
  type: 'eopkg';
  subType: 'thirdParty';
  platform: ['linux'];
  specUrl: string;
  packageFilePattern: string;
}

export type ManagedPackageSource = AptPackage | BrewPackage | SnapPackage | EoPackage; //AnyGenericPackage | AnyFilePackage | ThirdPartyEopkg | BrewPackage;

export interface UnloadedPackageManager<T extends ManagedPackageSource> {
  name: string;
  status?: undefined;
  getStatus: () => Promise<PackageManagerStatus>;
  isPackageInstalled: (pkg: T) => Promise<boolean>;
  installPackageManager?: SoftwarePackage;
  installPackage: (pkg: T) => Promise<void>;
  installPackages?: (pkgs: T[]) => Promise<void>;
}
export interface LoadedPackageManager<T extends ManagedPackageSource> {
  name: string;
  status: PackageManagerStatus;
  getStatus: () => Promise<PackageManagerStatus>;
  isPackageInstalled: (pkg: T) => Promise<boolean>;
  installPackageManager?: SoftwarePackage;
  installPackage: (pkg: T) => Promise<void>;
  installPackages?: (pkgs: T[]) => Promise<void>;
}
export type PackageManager<T extends ManagedPackageSource> = UnloadedPackageManager<T> | LoadedPackageManager<T>;



interface BaseInstallScript<S extends string> extends BasePackageSource {
  type: 'script';
  subType: S;
  getStatus: () => Promise<PackageManagerStatus>;
  dependencies?: SoftwarePackage[];
}
export interface LocalInstallScript extends BaseInstallScript<'local'> {
  install: () => Promise<void>;
}
export interface RemoteInstallScript extends BaseInstallScript<'remote'> {
  scriptUrl: string;
  install: (localScriptPath: string) => Promise<void>;
}
export type InstallScript = LocalInstallScript | RemoteInstallScript;

export type PackageSource = ManagedPackageSource | TarballPackage | InstallScript;

export type PackageManagerStatus = 'ready' | 'uninstalled' | 'unsupported';

export async function loadPackageManager<T extends ManagedPackageSource>(packageManager: PackageManager<T>): Promise<LoadedPackageManager<T>> {
  if (packageManager.status != null) {
    return packageManager;
  }
  const loaded = packageManager as unknown as LoadedPackageManager<T>;
  loaded.status = await packageManager.getStatus();
  return loaded;
}

export function getPackageId(pkg: SoftwarePackage): string {
  return idify(pkg.name);
}
