import { download } from 'https://deno.land/x/download@v1.0.1/mod.ts';

import { PackageManager, PackageManagerStatus, SoftwarePackage } from '../api/package_types.ts';
import { run } from '../shell/run.ts';

export interface RemoteInstallScript extends SoftwarePackage<'script'> {
  scriptUrl: string;
}
export interface LocalInstallScript extends SoftwarePackage<'script'> {
  scriptPath: string;
}
export type InstallScript = RemoteInstallScript | LocalInstallScript;

type OmitKnownKeys<T> = Omit<T, 'type' | 'subType' | 'managed'>;

export function remoteInstallScript(params: OmitKnownKeys<RemoteInstallScript>): RemoteInstallScript {
  return {
    type: 'script',
    subType: 'remote',
    managed: false,
    ...params,
  };
}

export function localInstallScript(params: OmitKnownKeys<LocalInstallScript>): LocalInstallScript {
  return {
    type: 'script',
    subType: 'local',
    managed: false,
    ...params,
  };
}

export class ScriptInstaller extends PackageManager<'script', InstallScript> {
  override readonly name = 'script';

  protected override checkStatus(): Promise<PackageManagerStatus> {
    return Promise.resolve('ready');
  }

  async installPackage(pkg: InstallScript): Promise<void> {
    let localFilePath: string;
    if ('scriptUrl' in pkg) {
      const downloaded = await download(pkg.scriptUrl);
      localFilePath = downloaded.fullPath;
    } else {
      localFilePath = pkg.scriptPath;
    }
    await run([localFilePath]);
  }
}
