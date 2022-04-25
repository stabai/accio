import { Software } from '../api/package_types.ts';
import { remoteDebPackage } from '../managers/apt.ts';
import { brewFormula } from '../managers/brew.ts';
import { eoPackage } from '../managers/eopkg.ts';
import { snapPackage } from '../managers/snap.ts';

export const MinikubeSoftware: Software = {
  id: 'minikube',
  name: 'Minikube',
  sources: [
    eoPackage({ packageName: 'minikube' }),
    brewFormula({ formula: 'minikube', platform: ['linux', 'darwin'] }),
    remoteDebPackage({
      packageUrl: 'https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb',
    }),
    snapPackage({ packageName: 'minikube' }),
    // TODO(stabai): Add other install sources: https://minikube.sigs.k8s.io/docs/start/
  ],
};
