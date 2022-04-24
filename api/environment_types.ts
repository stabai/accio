import { EOL } from 'https://deno.land/std@0.132.0/fs/eol.ts';

export type Platform = typeof Deno.build.os;

export interface PlatformInfo {
  platform: Platform;
  isRoot: boolean;
  homeDir: string;
  downloadDir: string;
  eol: EOL;
}
