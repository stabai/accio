import { Platform } from '../api/environment_types.ts';
import { ALL_SOFTWARE_IDS, Software, SoftwareCatalog, SoftwareFilter, SoftwareId } from '../api/package_types.ts';
import { anyTrue } from '../api/util_types.ts';
import { isInstalledWithPackageManager } from '../managers/index.ts';
import { SnapSoftware } from '../managers/snap.ts';
import { platform } from '../shell/environment.ts';
import { checkCommandAvailable } from '../shell/run.ts';
import { BraveBrowserSoftware } from './brave.ts';
import { BuildEssentialsSoftware } from './build_essentials.ts';
import { CurlSoftware } from './curl.ts';
import { DiscordSoftware } from './discord.ts';
import { GitSoftware } from './git.ts';
import { ITermSoftware } from './iterm2.ts';
import { KarabinerElementsSoftware } from './karabiner_elements.ts';
import { SlackSoftware } from './slack.ts';
import { TarSoftware } from './tar.ts';
import { VsCodeSoftware } from './vscode.ts';
import { WgetSoftware } from './wget.ts';
import { ZoomSoftware } from './zoom.ts';
import { ZshSoftware } from './zsh.ts';

export const ALL_SOFTWARE: SoftwareCatalog = {
  brave_browser: BraveBrowserSoftware,
  build_essentials: BuildEssentialsSoftware,
  curl: CurlSoftware,
  discord: DiscordSoftware,
  git: GitSoftware,
  iterm2: ITermSoftware,
  karabiner_elements: KarabinerElementsSoftware,
  slack: SlackSoftware,
  snap: SnapSoftware,
  tar: TarSoftware,
  vscode: VsCodeSoftware,
  wget: WgetSoftware,
  zoom: ZoomSoftware,
  zsh: ZshSoftware,
} as const;

export async function getSoftware(filter: SoftwareFilter, softwareList?: string[]): Promise<Software[]> {
  const packages = new Array<Software>();
  const softwareIds = (softwareList ?? ALL_SOFTWARE_IDS) as SoftwareId[];
  for (const id of softwareIds) {
    const pkg = ALL_SOFTWARE[id];
    if (await matchesFilter(filter, pkg)) {
      packages.push(pkg);
    }
  }
  return packages;
}

export async function isInstalled(software: Software): Promise<boolean> {
  const promises = new Array<Promise<boolean | undefined>>();
  if (software.installStatusChecker != null) {
    promises.push(software.installStatusChecker());
  }
  if (software.commandLineTools != null) {
    for (const tool of software.commandLineTools) {
      promises.push(checkCommandAvailable(tool));
    }
  }
  for (const pkg of software.sources) {
    promises.push(isInstalledWithPackageManager(pkg));
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
