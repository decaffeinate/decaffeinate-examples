import commander from 'commander';
import { exists, mkdtemp } from 'mz/fs';
import path from 'path';

import run from './run';

export default function cli() {
  let project = null;
  commander
    .arguments('<project>')
    .description('Run decaffeinate on one of the sample projects.')
    .action(projectArg => project = projectArg)
    .parse(process.argv);

  runCli(project);
}

async function runCli(project) {
  try {
    await testProject(project);
  } catch (e) {
    console.error(e.message);
  }
}

async function testProject(project) {
  let exampleDir = path.resolve(`./examples/${project}`);
  if (!await exists(exampleDir)) {
    throw new Error(`Unknown project: ${project}`);
  }

  let config = require(`../examples/${project}/config`).default;
  let repoDir = await mkdtemp(`./tmp-projects/${project}-`);

  await run(`git clone ${config.cloneUrl} ${repoDir}`);

  if (await exists(`${exampleDir}/config-files`)) {
    await run(`cp -R ${exampleDir}/config-files/. ${repoDir}`);
  }

  process.chdir(repoDir);
  await run('bulk-decaffeinate check');
  await run('npm install');
  if (config.extraDependencies.length > 0) {
    await run(`npm install --save-dev ${config.extraDependencies.join(' ')}`);
  }
  await run('git add -A');
  await run('git commit -m "Add dependencies and config to prepare for decaffeinate"');
  await run('bulk-decaffeinate convert');
  await run('bulk-decaffeinate clean');
  // Make the patch its own commit after everything else so it's easier to
  // iterate on.
  if (await exists(`${exampleDir}/decaffeinate.patch`)) {
    await run(`git apply ${exampleDir}/decaffeinate.patch`);
    await run('git add -A');
    await run('git commit -m "Modify the build to work with JavaScript"');
  }
  await run('npm test');
}
