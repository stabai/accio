import { EOL_CHAR } from './util_types.ts';

export interface AppVersionInfo {
  accioVersion: string;
}

export function getVersionInfo(versionInfoRaw: string): string {
  const rawVersion = JSON.parse(versionInfoRaw) as AppVersionInfo;
  const parts = [`accio ${rawVersion.accioVersion}`];
  for (const key of Object.keys(Deno.version)) {
    const version = Deno.version[key as keyof typeof Deno.version];
    parts.push(key + ' ' + version);
  }
  return parts.join(EOL_CHAR);
}
