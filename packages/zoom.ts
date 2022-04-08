import { Software } from '../api/package_types.ts';
import { brewCask } from '../managers/brew.ts';
import { snapPackage } from '../managers/snap.ts';

export const ZoomSoftware: Software = {
  id: 'zoom',
  name: 'Zoom',
  commandLineTools: ['zoom', 'zoom-client'],
  sources: [
    brewCask({ cask: 'zoom' }),
    snapPackage({ packageName: 'zoom-client' }),
  ],
};
