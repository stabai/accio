import { Software } from '../api/package_types.ts';
import { brewFormula } from '../managers/brew.ts';

export const BufSoftware: Software = {
  id: 'buf',
  name: 'Buf',
  sources: [
    brewFormula({ formula: 'bufbuild/buf/buf', platform: ['linux', 'darwin'] }),
    // TODO(stabai): Add other install sources: https://docs.buf.build/installation
  ],
};
