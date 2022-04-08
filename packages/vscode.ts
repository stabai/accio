import { Software } from '../api/package_types.ts';
import { brewCask } from '../managers/brew.ts';
import { snapPackage } from '../managers/snap.ts';

export const VsCodeSoftware: Software = {
  id: 'vscode',
  name: 'Visual Studio Code',
  commandLineTools: ['code', 'code-oss'],
  sources: [
    brewCask({ cask: 'visual-studio-code' }),
    snapPackage({ packageName: 'code' }),
  ],
};
