import { Platform } from '../api/environment_types.ts';
import { SnapSoftware } from '../managers/snap.ts';
import { BuildEssentialsSoftware } from '../packages/build_essentials.ts';
import { CurlSoftware } from '../packages/curl.ts';
import { GitSoftware } from '../packages/git.ts';
import { KarabinerElementsSoftware } from '../packages/karabiner-elements.ts';
import { TarSoftware } from '../packages/tar.ts';
import { WgetSoftware } from '../packages/wget.ts';
import { BasePackageSource, GenericPackage, InstallScript, InstallSource } from './framework.ts';

// TODO(stabai): Change all of these from SoftwarePackage to something else (these are pieces of software, not the packages we intall them with)
export const ALL_SOFTWARE = {
  build_essentials: BuildEssentialsSoftware,
  curl: CurlSoftware,
  git: GitSoftware,
  karabiner_elements: KarabinerElementsSoftware,
  snap: SnapSoftware,
  tar: TarSoftware,
  wget: WgetSoftware,
};

export type SoftwareCatalog = typeof ALL_SOFTWARE;
export type SoftwareId = keyof SoftwareCatalog;
export const ALL_SOFTWARE_IDS = Object.keys(ALL_SOFTWARE) as SoftwareId[];

export interface PackageManagers {
  tarball: InstallSource<TarballPackage>;
  script: InstallSource<InstallScript>;

  apt: InstallSource<AptPackage>;
  brew: InstallSource<BrewPackage>;
  // dpkg: InstallSource<DebPackage>;
  // gem: InstallSource<GemPackage>;
  // go: InstallSource<GoPackage>;
  eopkg: InstallSource<EoPackage>;
  // flatpak: InstallSource<FlatpakPackage>;
  // macports: InstallSource<MacportsPackage>;
  // pacman: InstallSource<PacmanPackage>;
  // npm: InstallSource<NpmPackage>;
  // rpm: InstallSource<RpmPackage>;
  snap: InstallSource<SnapPackage>;
  // tarball: InstallSource<TarballPackage>;
  // yum: InstallSource<YumPackage>;

  // TODO(stabai):
  // cargo: InstallSource<DnfPackage>;
  // dnf: InstallSource<DnfPackage>;
  // git: InstallSource<GitPackage>;
  // pip: InstallSource<DnfPackage>;
  // zypper: InstallSource<ZypperPackage>;
  // If adding Windows:
  // choco: InstallSource<ChocoPackage>;
  // nuget: InstallSource<NuGetPackage>;
  // winget: InstallSource<WinGetPackage>;
}

export type PackageType = keyof PackageManagers;
export type ManualPackageTypes = 'script' | 'tarball';
export type ManagedPackageTypes = Exclude<PackageType, ManualPackageTypes>;

export type AptPackage = GenericPackage<'apt'>;
// export type GemPackage = GenericPackage<'gem'>;
// export type GoPackage = GenericPackage<'go'>;
export interface EoPackage extends GenericPackage<'eopkg'> {
  component?: boolean;
}
// export type FlatpakPackage = GenericPackage<'flatpak'>;
// export type MacportsPackage = GenericPackage<'macports'>;
// export type PacmanPackage = GenericPackage<'pacman'>;
// export type NpmPackage = GenericPackage<'npm'>;
export type SnapPackage = GenericPackage<'snap'>;
// export type YumPackage = GenericPackage<'yum'>;

// interface FilePackage<T extends PackageType, S extends string | undefined = undefined> extends BasePackageSource, Package<T> {
//   type: T;
//   subType?: S;
//   packageUrl: string;
// }
// export type DebPackage = FilePackage<'dpkg'>;
// export type RpmPackage = FilePackage<'rpm'>;
// type AnyFilePackage = DebPackage | RpmPackage;

export interface TarballPackage extends BasePackageSource {
  type: 'tarball';
  managed: false;
  packageUrl: string;
  installer: (extractedDir: string) => Promise<void>;
}
export interface BrewFormula extends BasePackageSource {
  type: 'brew';
  subType: 'formula';
  managed: true;
  platform: Platform[];
  formula: string;
}
export interface BrewCask extends BasePackageSource {
  type: 'brew';
  subType: 'cask';
  managed: true;
  platform: ['darwin'];
  cask: string;
}
export type BrewPackage = (BrewFormula | BrewCask);

export interface ThirdPartyEopkg extends BasePackageSource {
  type: 'eopkg';
  subType: 'thirdParty';
  managed: false;
  platform: ['linux'];
  specUrl: string;
  packageFilePattern: string;
}
