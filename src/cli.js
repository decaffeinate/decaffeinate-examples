import commander from 'commander';
import { exists } from 'mz/fs';
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
    process.exitCode = 1;
  }
}

async function testProject(project) {
  let exampleDir = path.resolve(`./examples/${project}`);
  if (!await exists(exampleDir)) {
    throw new Error(`Unknown project: ${project}`);
  }

  let config = require(`../examples/${project}/config`).default;

  let suffix = Math.floor(Math.random() * 1000000000000);
  let repoDir = `./tmp-projects/${project}-${suffix}`;
  await run(`mkdir ${repoDir}`);

  await run(`git clone ${config.cloneUrl} ${repoDir}`);

  if (config.useDefaultConfig) {
    await run(`cp -R ./default-config/. ${repoDir}`);
  }
  if (await exists(`${exampleDir}/bulk-decaffeinate.config.js`)) {
    await run(`cp ${exampleDir}/bulk-decaffeinate.config.js ${repoDir}`);
  }

  process.chdir(repoDir);
  await run('bulk-decaffeinate check');
  await run('npm install');
  let dependencies = getDependencies(config);
  if (dependencies.length > 0) {
    await run(`npm install --save-dev ${dependencies.join(' ')}`);
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

const DEFAULT_PACKAGES = [
  'babel-polyfill',
  'babel-preset-env',
  'babel-register',
  'eslint',
  'eslint-config-airbnb-base',
  'eslint-plugin-import',
];

function getDependencies(config) {
  let dependencies = [];
  if (config.useDefaultConfig) {
    dependencies.push(...DEFAULT_PACKAGES);
  }
  if (config.extraDependencies) {
    dependencies.push(...config.extraDependencies);
  }
  return dependencies;
}
