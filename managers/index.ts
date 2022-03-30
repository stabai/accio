import { LoadedPackageManager, AptPackage, BrewPackage, SnapPackage, loadPackageManager, ManagedPackageSource, PackageSource, EoPackage } from "../api/package_types.ts";
import { PromiseRecord, awaitRecord } from "../api/util_types.ts";
import { AptPackageManager } from "./apt.ts";
import { BrewPackageManager } from "./brew.ts";
import { EoPackageManager } from "./eopkg.ts";
import { SnapPackageManager } from "./snap.ts";

export interface PackageManagers {
  apt: LoadedPackageManager<AptPackage>;
  brew: LoadedPackageManager<BrewPackage>;
  // dpkg: LoadedPackageManager<DebPackage>;
  // gem: LoadedPackageManager<GemPackage>;
  // go: LoadedPackageManager<GoPackage>;
  eopkg: LoadedPackageManager<EoPackage>;
  // flatpak: LoadedPackageManager<FlatpakPackage>;
  // macports: LoadedPackageManager<MacportsPackage>;
  // pacman: LoadedPackageManager<PacmanPackage>;
  // npm: LoadedPackageManager<NpmPackage>;
  // rpm: LoadedPackageManager<RpmPackage>;
  snap: LoadedPackageManager<SnapPackage>;
  // tarball: LoadedPackageManager<TarballPackage>;
  // yum: LoadedPackageManager<YumPackage>;

  // TODO:
  // cargo: LoadedPackageManager<DnfPackage>;
  // dnf: LoadedPackageManager<DnfPackage>;
  // git: LoadedPackageManager<GitPackage>;
  // pip: LoadedPackageManager<DnfPackage>;
  // zypper: LoadedPackageManager<ZypperPackage>;
  // If adding Windows:
  // choco: LoadedPackageManager<ChocoPackage>;
  // nuget: LoadedPackageManager<NuGetPackage>;
  // winget: LoadedPackageManager<WinGetPackage>;
}

export const packageManagers = await getPackageManagers();

export type PackageType = keyof PackageManagers;
export function isManagedSource(src: PackageSource): src is ManagedPackageSource {
  return Object.keys(packageManagers).includes(src.type);
}

function getPackageManagers(): Promise<PackageManagers> {
  const promises: PromiseRecord<PackageManagers> = {
    apt: loadPackageManager(AptPackageManager),
    brew: loadPackageManager(BrewPackageManager),
    snap: loadPackageManager(SnapPackageManager),
    eopkg: loadPackageManager(EoPackageManager),
  };
  return awaitRecord(promises);
}

export async function isInstalledWithPackageManager<T extends ManagedPackageSource>(src: T): Promise<boolean> {
  const mgr = packageManagers[src.type] as LoadedPackageManager<T>;
  const status = await mgr.getStatus();
  if (status !== 'ready') {
    return false;
  } else {
    const result = await mgr.isPackageInstalled(src);
    return result;
  }
}
