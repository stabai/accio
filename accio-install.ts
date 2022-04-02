import { cyan, magenta, red, yellow } from 'https://deno.land/std@0.133.0/fmt/colors.ts';
import { ManualPostInstallStep } from './api/package_types.ts';

import { chooseInstallPackage, getSoftware, isInstalled } from './packages/index.ts';
import { getPackageTypeName, SoftwarePackageChoice } from './repository/framework.ts';
import { platform } from './shell/environment.ts';
import { CellContent, Table } from './ui/table.ts';

export interface InstallOptions {
  softwareIds: string[];
  dryRun: boolean;
  force: boolean;
}

export async function runInstall(options: InstallOptions): Promise<number | void> {
  const softwareList = await getSoftware('all', options.softwareIds);
  const installChoices: SoftwarePackageChoice[] = [];
  let manualPostInstallStep: ManualPostInstallStep | undefined;
  for (const software of softwareList) {
    console.log();
    const installed = await isInstalled(software);
    if (installed) {
      console.log(`${cyan(software.name)} is already installed.`);
      if (options.force) {
        console.log('But flag --force was set, will install anyways.');
      } else {
        console.log('Skipping');
        continue;
      }
    }
    const pkgChoice = chooseInstallPackage(software);
    installChoices.push(pkgChoice);
    if (pkgChoice.package == null) {
      console.log(
        `No available install option for ${cyan(software.name)}; needs one of [${
          magenta(software.sources.map(getPackageTypeName).join(','))
        }].`,
      );
    } else {
      console.log(
        `Will install ${cyan(software.id)} from ${magenta(getPackageTypeName(pkgChoice.package))}.`,
      );
    }
    if (pkgChoice.package?.manualPostInstallStep != null) {
      manualPostInstallStep = pkgChoice.package.manualPostInstallStep;
      break;
    }
  }

  console.log();
  if (installChoices.length === 0) {
    console.log('No software to install!');
    return;
  }

  let errors = false;
  const tableRows = installChoices.map((sc) => {
    const pkg: CellContent = { value: sc.software.id, formatter: cyan };
    let src: CellContent;
    if (sc.package != null) {
      src = { value: getPackageTypeName(sc.package), formatter: magenta };
    } else {
      errors = true;
      src = { value: 'unavailable', formatter: red };
    }
    return [pkg, src];
  });
  let actionSummary = new Table({ rows: tableRows }).header('Software', 'Package Source').render();
  if (manualPostInstallStep != null) {
    actionSummary += platform.eol + yellow(`⏸️  A ${manualPostInstallStep} will be required to complete installation.`);
  }

  if (errors) {
    console.log('Would install the following software, but some are unavailable:');
    console.log(actionSummary);
    Deno.exit(1);
  }

  if (options.dryRun) {
    console.error('Would install the following software, but --dryrun was set:');
    console.log(actionSummary);
  } else {
    console.log('The following software will be installed:');
    console.log(actionSummary);

    console.log();
    if (confirm('Proceed with installation?')) {
      // TODO(stabai): Group packages and run actual installations
      console.log('now!');
    }
  }
}
