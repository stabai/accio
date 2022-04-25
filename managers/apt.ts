import { join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import { download } from 'https://deno.land/x/download@v1.0.1/mod.ts';
import {
  MultiInstallPackageManager,
  PackageManagerStatus,
  SimpleManagedPackage,
  SoftwarePackage,
} from '../api/package_types.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable, runPiped, runSudo } from '../shell/run.ts';

// TODO(stabai): Add ability to add gpg+sources: https://brave.com/linux/#debian-9-ubuntu-1604-and-mint-18-2

// TODO(stabai): Add ability to add ppa repos: https://github.com/golang/go/wiki/Ubuntu#using-ppa

let aptNeedsUpdate = true;

export interface PersonalPackageArchive {
  ppaKey: string;
}
export interface SignedSourceList {
  gpgKeyUrl: string;
  arch?: 'amd64';
  aptRepoUrl: string;
  distribution: string;
  component: string;
  sourceListFileName: string;
}
export type AptSourceList = PersonalPackageArchive | SignedSourceList;

export interface ManagedAptPackage extends SimpleManagedPackage<'apt'> {
  type: 'apt';
  subType: 'managed';
  managed: true;
  requiresRoot: true;
  platform: ['linux'];
  requiredRepos?: AptSourceList[];
  packageName: string;
}

export interface LocalDebPackage extends SoftwarePackage<'apt'> {
  type: 'apt';
  subType: 'local';
  managed: true;
  requiresRoot: true;
  platform: ['linux'];
  packagePath: string;
}

export interface RemoteDebPackage extends SoftwarePackage<'apt'> {
  type: 'apt';
  subType: 'remote';
  managed: true;
  requiresRoot: true;
  platform: ['linux'];
  packageUrl: string;
}

export type AptPackage = ManagedAptPackage | LocalDebPackage | RemoteDebPackage;

type OmitKnownKeys<T> = Omit<T, 'type' | 'subType' | 'platform' | 'managed' | 'requiresRoot'>;

export function aptPackage(params: OmitKnownKeys<ManagedAptPackage>): AptPackage {
  return {
    type: 'apt',
    subType: 'managed',
    platform: ['linux'],
    managed: true,
    requiresRoot: true,
    ...params,
  };
}
export function remoteDebPackage(
  params: OmitKnownKeys<RemoteDebPackage>,
): AptPackage {
  return {
    type: 'apt',
    subType: 'remote',
    platform: ['linux'],
    managed: true,
    requiresRoot: true,
    ...params,
  };
}
export function localDebPackage(
  params: OmitKnownKeys<LocalDebPackage>,
): AptPackage {
  return {
    type: 'apt',
    subType: 'local',
    platform: ['linux'],
    managed: true,
    requiresRoot: true,
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
    const managed = pkgs.filter((pkg) => pkg.subType === 'managed') as ManagedAptPackage[];
    if (managed.length > 0) {
      const requiredRepos = managed
        .filter((pkg) => pkg.requiredRepos != null && pkg.requiredRepos.length > 0)
        .map((pkg) => pkg.requiredRepos!).flat();
      if (requiredRepos.length > 0) {
        await installRepos(requiredRepos);
      }
      if (aptNeedsUpdate) {
        await runSudo(['apt', 'update']);
        aptNeedsUpdate = false;
      }
    }
    const pkgKeys = await Promise.all(pkgs.map((pkg) => getPackageKey(pkg)));
    await runSudo(['apt', 'install', ...pkgKeys]);
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

async function installRepos(repos: AptSourceList[]): Promise<void> {
  const promises: Promise<unknown>[] = [];
  const ppas: PersonalPackageArchive[] = [];

  for (const repo of repos) {
    if ('ppaKey' in repo) {
      ppas.push(repo);
    } else if ('gpgKeyUrl' in repo) {
      promises.push(installSigned(repo));
    }
  }

  if (ppas.length > 0) {
    promises.push(installPpas(ppas));
  }

  if (promises.length === 0) {
    return;
  }
  aptNeedsUpdate = true;
  await Promise.all(promises);
}

async function installPpas(ppas: PersonalPackageArchive[]): Promise<void> {
  const ppaKeys = ppas.map((ppa) => ppa.ppaKey);
  await runSudo(['add-apt-repository', ...ppaKeys]);
}

async function installSigned(signed: SignedSourceList): Promise<void> {
  const keyring = await download(signed.gpgKeyUrl, { dir: '/usr/share/keyrings' });
  const sourceListPath = join('/etc/apt/sources.list.d', signed.sourceListFileName);
  const archString = signed.arch == null ? '' : ` arch=${signed.arch}`;
  await Deno.writeTextFile(
    sourceListPath,
    `deb [signed-by=${keyring.fullPath}${archString}] ${signed.aptRepoUrl} ${signed.distribution} ${signed.component}`,
  );
}
