import {
  getPackageTypeName,
  PackageType,
  SoftwarePackageChoice,
  SoftwarePackageGroupings,
  SoftwareTypeGrouping,
} from '../api/package_types.ts';
import { KeyedSet } from '../api/util_types.ts';
import { getPackageManager, supportsMultiInstall } from '../managers/index.ts';

export function groupSoftwarePackageChoices(packageChoices: SoftwarePackageChoice[]): SoftwarePackageGroupings {
  const groupings = new KeyedSet<string, SoftwareTypeGrouping>((g) => g.name);
  for (const choice of packageChoices) {
    if (choice.package == null) {
      continue;
    }

    const source = getPackageManager(choice.package.type);
    if (!supportsMultiInstall(choice.package.type)) {
      const group: SoftwareTypeGrouping = {
        name: getPackageTypeName(choice.package),
        type: choice.package.type,
        packages: [choice.package],
        source,
      };
      groupings.put(group);
      continue;
    }

    let group = groupings.get(choice.package.type);
    if (group == null) {
      group = { name: choice.package.type, type: choice.package.type, source, packages: [] };
      groupings.put(group);
    }
    group?.packages.push(choice.package);
  }
  return groupings;
}

export function installPackageGroup<T extends PackageType>(group: SoftwareTypeGrouping<T>): Promise<void> {
  const mgr = getPackageManager(group.type);
  if (mgr.installPackages != null) {
    return mgr.installPackages(...group.packages);
  } else if (group.packages.length === 1) {
    return mgr.installPackage(group.packages[0]);
  } else {
    throw new Error(`Package group installation for single installer type: ${group.type}`);
  }
}
