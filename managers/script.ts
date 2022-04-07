import { PackageManager, PackageManagerStatus, SoftwarePackage } from '../api/package_types.ts';

export interface InstallScript extends SoftwarePackage<'script'> {
  scriptUrl: string;
}

export class ScriptInstaller extends PackageManager<'script', InstallScript> {
  override readonly name = 'script';

  protected override checkStatus(): Promise<PackageManagerStatus> {
    return Promise.resolve('ready');
  }

  installPackage(pkg: InstallScript): Promise<void> {
    throw new Error('Function not implemented.');
  }
}
