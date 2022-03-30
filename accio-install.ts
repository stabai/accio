import { getSoftware, isInstalled } from "./packages/index.ts";

export interface InstallOptions {
  softwareIds: string[];
  dryRun: boolean;
  force: boolean;
}

export async function runInstall(options: InstallOptions): Promise<void> {
  console.log(options);
  const software = await getSoftware('all', options.softwareIds);
  for (const pkg of software) {
    const installed = await isInstalled(pkg);
    if (installed) {
      console.log(`${pkg.name} is already installed.`);
      if (options.force) {
        console.log('Flag --force was set, installing anyways.');
      } else {
        console.log('Skipping');
        continue;
      }
    }
    if (options.dryRun) {
      console.log(`Would install ${pkg.name}, but --dryrun was set.`);
    } else {
      console.log('now!');
    }
  }
  console.log(software);
}

