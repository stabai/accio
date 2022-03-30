import { Platform, SoftwarePackage } from "../api/package_types.ts";
import { isInstalledWithPackageManager, isManagedSource } from "../managers/index.ts";
import { platform } from "../shell/environment.ts";
import { checkCommandAvailable } from "../shell/run.ts";
import { BuildEssentialsPackage } from "./build_essentials.ts";
import { CurlPackage } from "./curl.ts";
import { GitPackage } from "./git.ts";
import { KarabinerElementsPackage } from "./karabiner-elements.ts";
import { TarPackage } from "./tar.ts";
import { WgetPackage } from "./wget.ts";

export const allSoftwarePackages = {
  build_essentials: BuildEssentialsPackage,
  curl: CurlPackage,
  git: GitPackage,
  karabiner_elements: KarabinerElementsPackage,
  tar: TarPackage,
  wget: WgetPackage,
};
type SoftwarePackageId = keyof typeof allSoftwarePackages;
const allSoftwarePackageIds = Object.keys(allSoftwarePackages) as SoftwarePackageId[];

export type SoftwarePackages = typeof allSoftwarePackages;
export type PackageId = keyof SoftwarePackages;

export const SOFTWARE_FILTERS = ['installable', 'installed', 'uninstalled', 'all'] as const;
export type SoftwareFilter = typeof SOFTWARE_FILTERS[number];

export async function getSoftware(filter: SoftwareFilter, softwareList?: string[]): Promise<SoftwarePackage[]> {
  const packages = new Array<SoftwarePackage>();
  const list = softwareList ?? [];
  for (const id of allSoftwarePackageIds) {
    if (list.length > 0 && !list.includes(id)) {
      continue;
    }
    const pkg = allSoftwarePackages[id];
    if (await matchesFilter(filter, pkg)) {
      packages.push(pkg);
    }
  }
  return packages;
}

// export async function install(pkg: SoftwarePackage): Promise<void> {
//   for (const src of pkg.sources) {
//     if (!isManagedSource(src)) {
//     } else {
//       const mgr = packageManagers[src.type];
//       if (mgr.status === 'ready') {
//         const srcName = [src.type, src.subType].filter(x => x != null).join(' ');
//         console.log(`Installing ${pkg.name} via ${srcName}...`);
//         await mgr.installPackage(src);
//         console.log(`${pkg.name} installed successfully.`);
//       }
//     }
//   }
// }

export async function isInstalled(pkg: SoftwarePackage): Promise<boolean> {
  const promises = new Array<Promise<boolean | undefined>>();
  if (pkg.installStatusChecker != null) {
    promises.push(pkg.installStatusChecker());
  }
  if (pkg.commandLineTools != null) {
    for (const tool of pkg.commandLineTools) {
      promises.push(checkCommandAvailable(tool));
    }
  }
  for (const src of pkg.sources) {
    if (isManagedSource(src)) {
      promises.push(isInstalledWithPackageManager(src));
    }
  }
  return await anyTrue(promises);
}

async function matchesFilter(filter: SoftwareFilter, pkg: SoftwarePackage): Promise<boolean> {
  switch (filter) {
    case 'all':
      return true;
    case 'installable':
      for (const src of pkg.sources) {
        const platforms = src.platform as Platform[];
        if (platforms.includes(platform.platform)) {
          return true;
        }
      }
      return false;
    case 'installed':
      return await isInstalled(pkg);
    case 'uninstalled':
      return !(await isInstalled(pkg));
  }
}

async function anyTrue(promises: Promise<boolean | undefined>[]): Promise<boolean> {
  const racing = promises.map(p => p.then(result => {
    if (result !== true) {
      throw new Error('Check failed');
    } else {
      return true;
    }
  }));
  try {
    return await Promise.any(racing);
  } catch {
    return false;
  }
}
