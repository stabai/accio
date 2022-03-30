import { join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import os from 'https://deno.land/x/dos@v0.11.0/mod.ts';

import { PlatformInfo } from "../api/package_types.ts";

export const platform: PlatformInfo = {
  platform: Deno.build.os,
  homeDir: os.homeDir()!,
  downloadDir: join(os.homeDir()!, 'Downloads'),
  eol: Deno.build.os === 'windows' ? '\r\n' : '\n',
};

export function expandPath(path: string) {
  if (path.startsWith('~/')) {
    return join(platform.homeDir, path.substring(1));
  } else {
    return path;
  }
}
