import { join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import dir from 'https://deno.land/x/dir@v1.2.0/mod.ts';
import { EOL } from 'https://deno.land/std@0.132.0/fs/eol.ts';
import { PlatformInfo } from '../api/environment_types.ts';

export const platform: PlatformInfo = {
  platform: Deno.build.os,
  homeDir: dir('home')!,
  downloadDir: dir('download')!,
  eol: Deno.build.os === 'windows' ? EOL.CRLF : EOL.LF,
};

export function expandPath(path: string) {
  if (path.startsWith('~/')) {
    return join(platform.homeDir, path.substring(1));
  } else {
    return path;
  }
}
