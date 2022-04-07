import { bold } from 'https://deno.land/std@0.129.0/fmt/colors.ts';
import { cyan, magenta, red, yellow } from 'https://deno.land/std@0.133.0/fmt/colors.ts';
import { getPackageTypeName, ManualPostInstallStep, Software, SoftwarePackageChoice } from './api/package_types.ts';
import { chooseInstallPackage } from './managers/index.ts';

import { getSoftware, isInstalled } from './packages/index.ts';
import { groupSoftwarePackageChoices, installPackageGroup } from './repository/grouping.ts';
import { platform } from './shell/environment.ts';
import { CellContent, Table } from './ui/table.ts';

export interface InstallOptions {
  softwareIds: string[];
  dryRun: boolean;
  force: boolean;
}

export async function runInstall(options: InstallOptions): Promise<number | void> {
  const softwareList = await getSoftware('all', options.softwareIds);
  const [installChoices, manualPostInstallStep] = await chooseInstallPackages(softwareList, options);

  console.log();
  if (installChoices.length === 0) {
    console.log('No software to install!');
    return;
  }

  const [actionSummary, errors] = summarizeInstall(installChoices, manualPostInstallStep);

  if (errors) {
    console.error('Would install the following software, but some are unavailable:');
    console.error(actionSummary);
    Deno.exit(1);
  }

  if (options.dryRun) {
    console.log('Would install the following software:');
    console.log(actionSummary);
    console.log('But --dryrun was set, so no action will actually be taken.');
    // TODO(stabai): Continue with install commands, but only print them and don't run them.
    return;
  } else {
    console.log('The following software will be installed:');
    console.log(actionSummary);
  }

  console.log();
  if (!confirm('Proceed with installation?')) {
    console.error('Installation aborted by user.');
    Deno.exit(1);
  }

  const groupings = groupSoftwarePackageChoices(installChoices);
  let i = 0;
  for (const group of groupings.values()) {
    i++;
    console.log();
    console.log(bold(`Step ${i}/${groupings.size}: ${group.type} packages`));
    installPackageGroup(group);
  }

  console.log();
  console.log('Installation completed successfully!');
}

async function chooseInstallPackages(
  softwareList: Software[],
  options: InstallOptions,
): Promise<[SoftwarePackageChoice[], ManualPostInstallStep | undefined]> {
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
  return [installChoices, manualPostInstallStep];
}

function summarizeInstall(
  installChoices: SoftwarePackageChoice[],
  manualPostInstallStep: ManualPostInstallStep | undefined,
): [string, boolean] {
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
    actionSummary += platform.eol + yellow(`⏸️  Rerun this installation after completing it.`);
  }
  return [actionSummary, errors];
}
