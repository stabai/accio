import { Software } from '../api/package_types.ts';
import { aptPackage } from '../managers/apt.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const BraveBrowserSoftware: Software = {
  id: 'brave_browser',
  name: 'Brave Web Browser',
  sources: [
    eoPackage({ packageName: 'brave' }),
    aptPackage({
      requiredRepos: [{
        gpgKeyUrl: 'https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg',
        arch: 'amd64',
        aptRepoUrl: 'https://brave-browser-apt-release.s3.brave.com/',
        distribution: 'stable',
        component: 'main',
        sourceListFileName: 'brave-browser-release.list',
      }],
      packageName: 'brave-browser',
    }),
    // TODO(stabai): Add other install sources: https://brave.com/linux/
  ],
};
