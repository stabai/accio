import { download } from 'https://deno.land/x/download@v1.0.1/mod.ts';
import { extname } from 'https://deno.land/std@0.135.0/path/mod.ts';

import { PackageManager, PackageManagerStatus, SoftwarePackage } from '../api/package_types.ts';
import { checkCommandAvailable, run } from '../shell/run.ts';

let checkInstall: boolean | undefined;

async function canUseCheckInstall(): Promise<boolean> {
  if (checkInstall == null) {
    checkInstall = await checkCommandAvailable('checkinstall');
  }
  return checkInstall;
}

async function defaultInstaller(extractedFolder: string): Promise<void> {
  await run(['./configure'], { cwd: extractedFolder });
  await run(['make'], { cwd: extractedFolder });
  if (await canUseCheckInstall()) {
    await run(['sudo', 'checkinstall'], { cwd: extractedFolder });
  } else {
    await run(['make', 'install'], { cwd: extractedFolder });
  }
}

export interface RemoteTarballPackage extends SoftwarePackage<'tarball'> {
  tarballUrl: string;
  customInstaller?: (extractedFolder: string) => Promise<void>;
}
export interface LocalTarballPackage extends SoftwarePackage<'tarball'> {
  tarballPath: string;
  customInstaller?: (extractedFolder: string) => Promise<void>;
}
export type TarballPackage = RemoteTarballPackage | LocalTarballPackage;

export class TarballInstaller extends PackageManager<'tarball', TarballPackage> {
  override readonly name = 'tarball';

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    const tarInstalled = await checkCommandAvailable('tar');
    return tarInstalled ? 'ready' : 'uninstalled';
  }

  async installPackage(pkg: TarballPackage): Promise<void> {
    let localFilePath: string;
    if ('tarballUrl' in pkg) {
      const downloaded = await download(pkg.tarballUrl);
      localFilePath = downloaded.fullPath;
    } else {
      localFilePath = pkg.tarballPath;
    }
    await run(['tar', '-zxvf', localFilePath]);
    const extractedFolder = localFilePath.substring(0, localFilePath.length - extname(localFilePath).length);
    if (pkg.customInstaller == null) {
      await defaultInstaller(extractedFolder);
    } else {
      await pkg.customInstaller(extractedFolder);
    }
  }
}
