import commander from 'commander';
import { exists, readdir, readFile, writeFile } from 'mz/fs';
import path from 'path';

import downloadFile from './downloadFile';
import run from './run';

export default function cli() {
  let project = null;
  commander
    .arguments('<project>')
    .description('Run decaffeinate on one of the sample projects.')
    .action(projectArg => project = projectArg)
    .option('--publish',
      `Push the resulting repository to the decaffeinate fork. The
           current git user must have permissions to do so.`)
    .parse(process.argv);

  runCli(project, commander.publish);
}

async function runCli(project, shouldPublish) {
  try {
    if (project === 'all') {
      await testAllProjects(shouldPublish);
    } else {
      await testProject(project, shouldPublish);
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exitCode = 1;
  }
}

async function testAllProjects(shouldPublish) {
  let projectNames = await readdir('./examples');
  console.log(`Processing all projects: ${projectNames.join(', ')}`);
  for (let project of projectNames) {
    console.log(`Processing project ${project}...`);
    await testProject(project, shouldPublish);
  }
  console.log(`Successfully processed all projects: ${projectNames.join(', ')}`);
}

async function testProject(project, shouldPublish) {
  let originalCwd = process.cwd();
  let exampleDir = path.resolve(`./examples/${project}`);
  if (!await exists(exampleDir)) {
    throw new Error(`Unknown project: ${project}`);
  }

  let config = require(`../examples/${project}/config`).default;

  let suffix = Math.floor(Math.random() * 1000000000000);
  let repoDir = `./tmp-projects/${project}-${suffix}`;
  await run(`mkdir ${repoDir}`);

  let cloneSuffix = config.branch ? `--branch ${config.branch}` : '';
  await run(`git clone ${config.cloneUrl} ${repoDir} ${cloneSuffix}`);

  if (config.useDefaultConfig) {
    await run(`cp -R ./default-config/. ${repoDir}`);
  }
  if (await exists(`${exampleDir}/bulk-decaffeinate.config.js`)) {
    await run(`cp ${exampleDir}/bulk-decaffeinate.config.js ${repoDir}`);
  }

  process.chdir(repoDir);

  if (shouldPublish) {
    await run(`git remote add fork ${config.forkUrl}`);
    await run('git fetch fork');
    // If we're using a custom branch/ref, it may not be valid to push to it, so
    // skip this step. (Currently this fits all use cases, but it can be made
    // more flexible later if necessary.)
    if (!config.branch) {
      await run('git push fork');
    }
  }

  await run('npm install');
  let dependencies = getDependencies(config);
  if (dependencies.length > 0) {
    await run(`npm install --save-dev ${dependencies.join(' ')}`);
  }
  await run('git add -A');
  await run('git commit -m "Add dependencies and config to prepare for decaffeinate"');

  let conversionResult = await checkConversion();
  if (!conversionResult.passed) {
    await run('git add -A');
    await run('git commit -m "Save decaffeinate error details"');

    await run('bulk-decaffeinate convert -p decaffeinate-successful-files.txt');
  } else {
    await run('bulk-decaffeinate convert');
  }

  await run('bulk-decaffeinate clean');
  // Make the patch its own commit after everything else so it's easier to
  // iterate on.
  if (await exists(`${exampleDir}/decaffeinate.patch`)) {
    await run(`git apply ${exampleDir}/decaffeinate.patch`);
    await run('git add -A');
    await run('git commit -m "Modify the build to work with JavaScript"');
  }
  let testResult = await runTests(config);

  if (shouldPublish) {
    await downloadFile(getConversionResultBadgeUrl(conversionResult), './conversion-status.svg');
    await downloadFile(getTestResultBadgeUrl(testResult), './test-status.svg');
    await writeFile('./README.md', getReadme(project, conversionResult, testResult));
    await run('git add -A');
    await run('git commit -m "Update README and badges with decaffeinate results"');
    await run('git push fork HEAD:decaffeinate -f');
  }

  process.chdir(originalCwd);
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

async function checkConversion() {
  await run('bulk-decaffeinate check');
  let hasErrorFile = await exists('./decaffeinate-errors.log');
  if (hasErrorFile) {
    let results = JSON.parse((await readFile('decaffeinate-results.json')).toString());
    let numErrors = results.filter(result => result.error).length;
    let numTotal = results.length;
    return {
      passed: false,
      numErrors,
      numTotal,
    };
  }
  return {
    passed: true,
  };
}

async function runTests(config) {
  if (config.skipTests) {
    console.log('Skipping tests for this project.');
    return 'SKIPPED';
  }
  try {
    await run('npm test');
    return 'PASSED';
  } catch (e) {
    return 'FAILED';
  }
}

function getReadme(project, conversionResult, testResult) {
  return `\
# decaffeinate fork of ${project}

![Conversion Status](https://cdn.rawgit.com/decaffeinate-examples/${project}/decaffeinate/conversion-status.svg)
![Test Status](https://cdn.rawgit.com/decaffeinate-examples/${project}/decaffeinate/test-status.svg)

## Conversion results

${getConversionResultDescription(conversionResult)}

## Test results

${getTestResultDescription(testResult)}

## About this repository

This repository was generated automatically by the [decaffeinate-examples]
project using the [decaffeinate] tool.

[decaffeinate-examples]: https://github.com/decaffeinate/decaffeinate-examples
[decaffeinate]: https://github.com/decaffeinate/decaffeinate
`;
}

function getConversionResultBadgeUrl(conversionResult) {
  if (conversionResult.passed) {
    return getBadgeUrl('decaffeinate conversion', 'success', 'brightgreen');
  } else {
    return getBadgeUrl(
      'decaffeinate conversion',
      `${conversionResult.numErrors}/${conversionResult.numTotal} failed`,
      'red'
    );
  }
}

function getTestResultBadgeUrl(testResult) {
  if (testResult === 'PASSED') {
    return getBadgeUrl('tests', 'passed', 'brightgreen');
  } else if (testResult === 'FAILED') {
    return getBadgeUrl('tests', 'failed', 'red');
  } else {
    return getBadgeUrl('tests', 'skipped', 'lightgrey');
  }
}

function getBadgeUrl(subject, status, color) {
  return `https://img.shields.io/badge/${encodeURI(subject)}-${encodeURI(status)}-${color}.svg`;
}

function getConversionResultDescription(conversionResult) {
  if (conversionResult.passed) {
    return 'All files were successfully converted to JavaScript.';
  } else {
    return `
There were ${conversionResult.numErrors} errors out of
${conversionResult.numTotal} total files.

For more details on the errors, view the [error logs](./decaffeinate-errors.log)
`;
  }
}

function getTestResultDescription(testResult) {
  if (testResult === 'PASSED') {
    return 'All tests passed.';
  } else if (testResult === 'FAILED') {
    return 'Some tests failed.';
  } else {
    return 'Post-decaffeinate tests have not yet been set up for this project.';
  }
}
