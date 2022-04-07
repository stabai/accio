import { PackageManager, PackageManagerStatus, SoftwarePackage } from '../api/package_types.ts';
import { checkCommandAvailable } from '../shell/run.ts';

export interface TarballPackage extends SoftwarePackage<'tarball'> {
  packageUrl: string;
}

export class TarballInstaller extends PackageManager<'tarball', TarballPackage> {
  override readonly name = 'tarball';

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    const tarInstalled = await checkCommandAvailable('tar');
    return tarInstalled ? 'ready' : 'uninstalled';
  }
  installPackage(pkg: TarballPackage): Promise<void> {
    throw new Error('Function not implemented.');
  }
}
