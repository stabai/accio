import { Software } from '../api/package_types.ts';
import { brewCask } from '../managers/brew.ts';

export const KarabinerElementsSoftware: Software = {
  id: 'karabiner_elements',
  name: 'Karabiner-Elements',
  sources: [
    brewCask({ cask: 'karabiner-elements' }),
  ],
};
