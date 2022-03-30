#!/usr/bin/env -S deno run --allow-all --allow-run --allow-env --unstable

import yargs from 'https://deno.land/x/yargs@v17.3.1-deno/deno.ts';
import { runInstall } from "./accio-install.ts";
import { CommandYargs, idify, NamedArgs } from "./api/util_types.ts";
import { getSoftware, SOFTWARE_FILTERS } from "./packages/index.ts";
import { platform } from "./shell/environment.ts";
import { Table } from "./ui/table.ts";
import { APP_VERSION } from "./version.ts";

const VERSION_INFO = summarizeVersion(APP_VERSION);

yargs(Deno.args)
  .scriptName('accio')
  .command('list [software...]', 'Installs software for use on this device.', (yargs: CommandYargs) => {
    return yargs
      .positional('software', {
        describe: 'software packages to list',
        array: true,
      })
      .option('filter', {
        type: 'string',
        description: 'filter packages to only those that match criteria',
        choices: SOFTWARE_FILTERS,
        default: 'installed',
      });
  }, async (argv: NamedArgs) => {
    const software = await getSoftware(argv.filter, argv.software);
    const table = new Table()
      .heading('ID', 'Name')
      .rows(...software.map(s => [idify(s.name), s.name]));
    console.log(table.render());
  })
  .command('diagnose', 'Shows diagnostic information for debugging.', () => {
    const parts = [VERSION_INFO];
    for (const key of Object.keys(Deno.build)) {
      const value = Deno.build[key as keyof typeof Deno.build];
      parts.push(`${key} ${value}`)
    }
    console.log(parts.join(platform.eol));
  })
  .command('install <software...>', 'Installs software for use on this device.', (yargs: CommandYargs) => {
    return yargs
      .positional('software', {
        describe: 'software packages to install',
        array: true,
      })
      .option('dryrun', {
        type: 'boolean',
        description: 'show work that would have been done, but don\'t make changes',
        default: false,
      })
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'install software even if already installed',
        default: false,
      });
  }, async (argv: NamedArgs) => {
    await runInstall({
      softwareIds: argv.software,
      dryRun: argv.dryrun,
      force: argv.force,
    });
  })
  .help()
  .demandCommand()
  .version(VERSION_INFO)
  .parse();


function summarizeVersion(appVersion: string): string {
  const parts = [`accio ${appVersion}`];
  for (const key of Object.keys(Deno.version)) {
    const version = Deno.version[key as keyof typeof Deno.version];
    parts.push(key + ' ' + version);
  }
  return parts.join(platform.eol);
}
