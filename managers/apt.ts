import { download } from 'https://deno.land/x/download@v1.0.1/mod.ts';
import {
  MultiInstallPackageManager,
  PackageManagerStatus,
  SimpleManagedPackage,
  SoftwarePackage,
} from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, run, runPiped } from '../shell/run.ts';

let aptUpdated = false;

export interface ManagedAptPackage extends SimpleManagedPackage<'apt'> {
  type: 'apt';
  subType: 'managed';
  managed: true;
  platform: ['linux'];
  packageName: string;
}

export interface LocalDebPackage extends SoftwarePackage<'apt'> {
  type: 'apt';
  subType: 'local';
  managed: true;
  platform: ['linux'];
  packagePath: string;
}

export interface RemoteDebPackage extends SoftwarePackage<'apt'> {
  type: 'apt';
  subType: 'remote';
  managed: true;
  platform: ['linux'];
  packageUrl: string;
}

export type AptPackage = ManagedAptPackage | LocalDebPackage | RemoteDebPackage;

export function aptPackage(params: Omit<ManagedAptPackage, 'type' | 'subType' | 'platform' | 'managed'>): AptPackage {
  return {
    type: 'apt',
    subType: 'managed',
    platform: ['linux'],
    managed: true,
    ...params,
  };
}
export function remoteDebPackage(
  params: Omit<RemoteDebPackage, 'type' | 'subType' | 'platform' | 'managed'>,
): AptPackage {
  return {
    type: 'apt',
    subType: 'remote',
    platform: ['linux'],
    managed: true,
    ...params,
  };
}
export function localDebPackage(
  params: Omit<LocalDebPackage, 'type' | 'subType' | 'platform' | 'managed'>,
): AptPackage {
  return {
    type: 'apt',
    subType: 'local',
    platform: ['linux'],
    managed: true,
    ...params,
  };
}

export class AptPackageManager extends MultiInstallPackageManager<'apt', AptPackage> {
  override readonly name = 'apt';

  protected override async checkStatus(): Promise<PackageManagerStatus> {
    if (platform.platform !== 'linux') {
      return 'unsupported';
    } else if (await checkCommandAvailable('apt')) {
      return 'ready';
    } else {
      return 'uninstalled';
    }
  }

  override async installPackages(...pkgs: AptPackage[]): Promise<void> {
    const anyManaged = pkgs.some((pkg) => pkg.subType === 'managed');
    if (anyManaged && !aptUpdated) {
      aptUpdated = true;
      await run(['sudo', 'apt', 'update']);
    }
    const pkgKeys = await Promise.all(pkgs.map((pkg) => getPackageKey(pkg)));
    await run(['sudo', 'apt', 'install', ...pkgKeys]);
  }

  override async isPackageInstalled(pkg: AptPackage): Promise<boolean | undefined> {
    try {
      const result = await runPiped(['apt', 'show', await getPackageKey(pkg)]);
      const resultLines = result.stdout.split(platform.eol).map((line) => line.replaceAll(' ', '').toLowerCase());
      return resultLines.includes('apt-manual-installed:yes');
    } catch (_) {
      // This is not fatal, just return undefined to indicate installation could not be verified.
      return undefined;
    }
  }
}

async function getPackageKey(pkg: AptPackage): Promise<string> {
  const subType = pkg.subType;
  switch (subType) {
    case 'managed':
      return pkg.packageName;
    case 'local':
      return pkg.packagePath;
    case 'remote':
      return (await download(pkg.packageUrl)).fullPath;
  }
}
