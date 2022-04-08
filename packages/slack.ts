import { Software } from '../api/package_types.ts';
import { brewCask } from '../managers/brew.ts';
import { snapPackage } from '../managers/snap.ts';

export const SlackSoftware: Software = {
  id: 'slack',
  name: 'Slack',
  commandLineTools: ['slack'],
  sources: [
    brewCask({ cask: 'slack' }),
    snapPackage({ packageName: 'slack' }),
  ],
};
