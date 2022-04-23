import { Software } from '../api/package_types.ts';
import { eoPackage } from '../managers/eopkg.ts';

export const BraveBrowserSoftware: Software = {
  id: 'brave_browser',
  name: 'Brave Web Browser',
  sources: [
    eoPackage({ packageName: 'brave' }),
    // TODO(stabai): Add other install sources: https://brave.com/linux/
  ],
};
