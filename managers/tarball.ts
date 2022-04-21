import { download } from 'https://deno.land/x/download@v1.0.1/mod.ts';
import { move } from 'https://deno.land/std@0.135.0/fs/mod.ts';
import { basename, dirname, extname, join } from 'https://deno.land/std@0.135.0/path/mod.ts';

import { PackageManager, PackageManagerStatus, SoftwarePackage } from '../api/package_types.ts';
import { checkCommandAvailable, run } from '../shell/run.ts';
import { platform } from '../shell/environment.ts';

let checkInstall: boolean | undefined;

export function remoteTarballPackage(
  params: Omit<RemoteTarballPackage, 'type' | 'subType' | 'platform' | 'managed'>,
): RemoteTarballPackage {
  return { type: 'tarball', subType: 'remote', platform: ['linux'], managed: false, ...params };
}

export function localTarballPackage(
  params: Omit<LocalTarballPackage, 'type' | 'subType' | 'platform' | 'managed'>,
): LocalTarballPackage {
  return { type: 'tarball', subType: 'local', platform: ['linux'], managed: false, ...params };
}

async function getMakeInstallCommand(): Promise<string[]> {
  if (checkInstall == null) {
    checkInstall = await checkCommandAvailable('checkinstall');
  }
  return checkInstall ? ['checkinstall'] : ['make', 'install'];
}

async function makeInstaller(extractedFolder: string): Promise<void> {
  const makeInstallPromise = getMakeInstallCommand();
  await run(['./configure'], { cwd: extractedFolder });
  await run(['make'], { cwd: extractedFolder });
  const makeInstallCommand = await makeInstallPromise;
  await run(['sudo', ...makeInstallCommand], { cwd: extractedFolder });
}

async function copyToOptInstaller(extractedFolder: string): Promise<void> {
  // TODO(stabai): Run sudo commands or suggest users execute accio with sudo?

  // const optFolder = join('/opt', basename(extractedFolder).toLowerCase());
  // await move(extractedFolder, optFolder);

  await run(['sudo', 'mv', extractedFolder, '/opt']);

  // TODO(stabai): Add symbolic link: sudo ln -sf /opt/$DIR/$APP /usr/bin/$APP
  // TODO(stabai): Add to app menu icon: sudo cp -r /opt/$DIR/$APP.desktop /usr/share/applications
  // TODO(stabai): Make sure exec path of menu item is right
}

export type KnownTarballInstallMethod = 'make' | 'copy_to_opt';
export type CustomTarballInstallMethod = (extractedFolder: string) => Promise<void>;
export type TarballInstallMethod = KnownTarballInstallMethod | CustomTarballInstallMethod;

export interface RemoteTarballPackage extends SoftwarePackage<'tarball'> {
  subType: 'remote';
  managed: false;
  platform: ['linux'];
  packageUrl: string;
  subFolder: string;
  installMethod: TarballInstallMethod;
}
export interface LocalTarballPackage extends SoftwarePackage<'tarball'> {
  subType: 'local';
  managed: false;
  platform: ['linux'];
  packagePath: string;
  subFolder: string;
  installMethod: TarballInstallMethod;
}
export type TarballPackage = RemoteTarballPackage | LocalTarballPackage;

export class TarballInstaller extends PackageManager<'tarball', TarballPackage> {
  override readonly name = 'tarball';

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    }
    const tarInstalled = await checkCommandAvailable('tar');
    return tarInstalled ? 'ready' : 'uninstalled';
  }

  async installPackage(pkg: TarballPackage): Promise<void> {
    let downloadDir: string;
    let localFilePath: string;
    if ('packageUrl' in pkg) {
      const downloaded = await download(pkg.packageUrl);
      localFilePath = downloaded.fullPath;
      downloadDir = downloaded.dir;
    } else {
      localFilePath = pkg.packagePath;
      downloadDir = platform.downloadDir;
    }
    await run(['tar', '--gzip', '--extract', '--file=' + localFilePath, '--directory=' + downloadDir]);
    const extractedFolder = join(downloadDir, pkg.subFolder);
    let installer: CustomTarballInstallMethod;
    switch (pkg.installMethod) {
      case 'make':
        installer = makeInstaller;
        break;
      case 'copy_to_opt':
        installer = copyToOptInstaller;
        break;
      default:
        installer = pkg.installMethod;
        break;
    }
    await installer(extractedFolder);
  }
}
