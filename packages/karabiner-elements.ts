import { SoftwarePackage } from "../api/package_types.ts";

export const KarabinerElementsPackage: SoftwarePackage = {
  name: 'Karabiner-Elements',
  sources: [
    {
      type: 'brew',
      subType: 'cask',
      platform: ['darwin'],
      cask: 'karabiner-elements',
    },
  ],
}
