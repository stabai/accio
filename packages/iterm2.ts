import { Software } from '../api/package_types.ts';
import { brewCask } from '../managers/brew.ts';

export const ITermSoftware: Software = {
  id: 'iterm2',
  name: 'iTerm',
  sources: [
    brewCask({ cask: 'iterm2' }),
  ],
};
