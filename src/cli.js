import commander from 'commander';
import { exists, mkdtemp } from 'mz/fs';
import path from 'path'

import run from './run';

export default function cli() {
  let project = null;
  commander
    .arguments('<project>')
    .description('Run decaffeinate on one of the sample projects.')
    .action(projectArg => project = projectArg)
    .parse(process.argv);

  testProject(project);
}

async function testProject(project) {
  try {
    let exampleDir = path.resolve(`./examples/${project}`);
    if (!await exists(exampleDir)) {
      throw new Error(`Unknown project: ${project}`);
    }

    let config = require(`../examples/${project}/config`).default;
    let repoDir = await mkdtemp(`./tmp-projects/${project}-`);

    await run(`git clone ${config.cloneUrl} ${repoDir}`);

    if (await exists(`${exampleDir}/config-files`)) {
      await run(`cp ${exampleDir}/config-files/* ${repoDir}`);
    }

    process.chdir(repoDir);
    await run('bulk-decaffeinate check');
    await run('npm install');
    if (config.extraDependencies.length > 0) {
      await run(`npm install --save-dev ${config.extraDependencies.join(' ')}`);
    }
    if (exists(`${exampleDir}/decaffeinate.patch`)) {
      await run(`git apply ${exampleDir}/decaffeinate.patch`)
    }
    await run('git commit -a -m "Add dependencies to prepare for decaffeinate"');
    await run('bulk-decaffeinate convert');
    await run('bulk-decaffeinate clean');
    await run('npm test');
  } catch (e) {
    console.error(e.message);
  }
}
