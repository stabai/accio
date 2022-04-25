import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { snapPackage } from '../managers/snap.ts';

export const KubectlSoftware: Software = {
  id: 'kubectl',
  name: 'Kubectl',
  sources: [
    eoPackage({ packageName: 'kubectl' }),
    snapPackage({ packageName: 'kubectl', useClassicMode: true }),
    aptPackage({
      requiredRepos: [{
        gpgKeyUrl: 'https://packages.cloud.google.com/apt/doc/apt-key.gpg',
        aptRepoUrl: 'https://apt.kubernetes.io/',
        distribution: 'kubernetes-xenial',
        component: 'main',
        sourceListFileName: 'kubernetes.list',
      }],
      packageName: 'kubectl',
    }),
    brewFormula({ formula: 'kubectl', platform: ['linux', 'darwin'] }),
    // TODO(stabai): Add other install sources: https://kubernetes.io/docs/tasks/tools/
  ],
};
