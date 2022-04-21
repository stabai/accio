import { Software } from '../api/package_types.ts';
import { remoteDebPackage } from '../managers/apt.ts';
import { brewCask } from '../managers/brew.ts';
import { snapPackage } from '../managers/snap.ts';
import { remoteTarballPackage } from '../managers/tarball.ts';

export const DiscordSoftware: Software = {
  id: 'discord',
  name: 'Discord',
  commandLineTools: ['discord'],
  sources: [
    // TODO(stabai): Add flatpak and tarball
    // flatpak({ remote: 'flathub', packageRef: 'com.discordapp.Discord' }),
    brewCask({ cask: 'discord' }),
    snapPackage({ packageName: 'discord' }),
    remoteDebPackage({ packageUrl: 'https://discordapp.com/api/download?platform=linux&format=deb' }),
    // remoteTarballPackage({
    //   packageUrl: 'https://discord.com/api/download?platform=linux&format=tar.gz',
    //   subFolder: './Discord',
    //   installMethod: 'copy_to_opt',
    // }),
  ],
};
