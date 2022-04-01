import { Platform } from '../api/environment_types.ts';
import { SoftwareFilter } from '../api/package_types.ts';
import { anyTrue } from '../api/util_types.ts';
import { isInstalledWithPackageManager, isManagedSource } from '../managers/index.ts';
import { ALL_SOFTWARE, ALL_SOFTWARE_IDS } from '../repository/content.ts';
import { Software } from '../repository/framework.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable } from '../shell/run.ts';

export async function getSoftware(filter: SoftwareFilter, softwareList?: string[]): Promise<Software[]> {
  const packages = new Array<Software>();
  const list = softwareList ?? [];
  for (const id of ALL_SOFTWARE_IDS) {
    if (list.length > 0 && !list.includes(id)) {
      continue;
    }
    const pkg = ALL_SOFTWARE[id];
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

export async function isInstalled(pkg: Software): Promise<boolean> {
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

async function matchesFilter(filter: SoftwareFilter, software: Software): Promise<boolean> {
  switch (filter) {
    case 'all':
      return true;
    case 'installable':
      for (const src of software.sources) {
        const platforms = src.platform as Platform[];
        if (platforms.includes(platform.platform)) {
          return true;
        }
      }
      return false;
    case 'installed':
      return await isInstalled(software);
    case 'uninstalled':
      return !(await isInstalled(software));
  }
}
