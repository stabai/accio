import { Software } from '../api/package_types.ts';
import { brewCask } from '../managers/brew.ts';
import { snapPackage } from '../managers/snap.ts';

export const DiscordSoftware: Software = {
  id: 'discord',
  name: 'Discord',
  commandLineTools: ['discord'],
  sources: [
    brewCask({ cask: 'discord' }),
    snapPackage({ packageName: 'discord' }),
  ],
};
