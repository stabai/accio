import { Software } from '../repository/framework.ts';

export const KarabinerElementsSoftware: Software = {
  id: 'karabiner_elements',
  name: 'Karabiner-Elements',
  sources: [
    {
      type: 'brew',
      subType: 'cask',
      managed: true,
      platform: ['darwin'],
      cask: 'karabiner-elements',
    },
  ],
};
