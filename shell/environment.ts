import { join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import dir from 'https://deno.land/x/dir@v1.2.0/mod.ts';
import { PlatformInfo } from '../api/environment_types.ts';
import { EOL_CHAR } from '../api/util_types.ts';
import { runPiped } from './run.ts';

export const platform: PlatformInfo = {
  platform: Deno.build.os,
  isRoot: await detectIfRoot(),
  homeDir: dir('home')!,
  downloadDir: dir('download')!,
  eol: EOL_CHAR,
};

export function expandPath(path: string) {
  if (path.startsWith('~/')) {
    return join(platform.homeDir, path.substring(1));
  } else {
    return path;
  }
}

async function detectIfRoot(): Promise<boolean> {
  const result = await runPiped(['id', '-u']);
  return result.stdout === '0';
}
