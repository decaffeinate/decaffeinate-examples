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
    process.exitCode = 1;
    console.error(`ERROR: ${e.message}`);
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
  await run(`git clone --depth=1 ${config.cloneUrl} ${repoDir} ${cloneSuffix}`);

  if (config.useDefaultConfig) {
    await run(`cp -R ./default-config/. ${repoDir}`);
  }
  if (await exists(`${exampleDir}/bulk-decaffeinate.config.js`)) {
    await run(`cp ${exampleDir}/bulk-decaffeinate.config.js ${repoDir}`);
  }
  if (await exists(`${exampleDir}/.eslintrc.js`)) {
    await run(`cp ${exampleDir}/.eslintrc.js ${repoDir}`);
  }
  if (await exists(`${exampleDir}/babelrc`)) {
    await run(`cp ${exampleDir}/babelrc ${repoDir}/.babelrc`);
  }
  if (await exists(`${exampleDir}/package.json`)) {
    await run(`cp ${exampleDir}/package.json ${repoDir}`);
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

  if (await exists(`${exampleDir}/.gitignore_extension`)) {
    await run(`cat ${exampleDir}/.gitignore_extension >> .gitignore`);
  }

  await run('npm install');
  let dependencies = getDependencies(config);
  if (dependencies.length > 0) {
    await run(`npm install --save-dev --save-exact ${dependencies.join(' ')}`);
  }
  await run('git add -A');
  await run('git commit -m "Add dependencies and config to prepare for decaffeinate"');

  if (config.beforeDecaffeinateScript) {
    await run(config.beforeDecaffeinateScript);
  }

  let conversionResult = await checkConversion(config);
  if (!conversionResult.passed) {
    await run('git add -A');
    await run('git commit -m "Save decaffeinate error details"');

    await run('bulk-decaffeinate convert --skip-verify -p decaffeinate-successful-files.txt');
  } else {
    await run('bulk-decaffeinate convert --skip-verify');
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

  await downloadFile(getConversionResultBadgeUrl(conversionResult), './conversion-status.svg');
  await downloadFile(getTestResultBadgeUrl(testResult), './test-status.svg');
  await writeFile('./README.md', getReadme(project, conversionResult, testResult));
  await run('git add -A');
  await run('git commit -m "Update README and badges with decaffeinate results"');

  if (shouldPublish) {
    await run('git push fork HEAD:decaffeinate -f');

    await run('git checkout --orphan gh-pages');
    await run('git rm --cached -r .');
    await run('git add conversion-status.svg');
    await run('git add test-status.svg');
    await run('git commit -m "Add status SVGs to gh-pages branch"');
    await run('git push fork HEAD:gh-pages -f');
  }

  process.chdir(originalCwd);
}

const DEFAULT_PACKAGES = [
  'babel-cli',
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

async function checkConversion(config) {
  // To reduce build times, skip the check step if we expect success. If there
  // is a problem later, it will end up as a crash and the build will fail.
  if (config.expectConversionSuccess) {
    return {
      passed: true,
    };
  }
  await run('bulk-decaffeinate check');
  let hasErrorFile = await exists('./decaffeinate-errors.log');
  if (hasErrorFile) {
    let results = JSON.parse((await readFile('decaffeinate-results.json')).toString());
    let numErrors = results.filter(result => result.error).length;
    let numTotal = results.length;
    if (config.expectConversionSuccess) {
      process.exitCode = 1;
    }
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
    if (config.testCommand) {
      await run(config.testCommand);
    } else {
      await run('npm test');
    }
    return 'PASSED';
  } catch (e) {
    if (config.expectTestSuccess) {
      process.exitCode = 1;
    }
    return 'FAILED';
  }
}

function getReadme(project, conversionResult, testResult) {
  let jobId = process.env.TRAVIS_JOB_ID;
  let jobMessage = jobId ?
    `[Travis logs](https://travis-ci.org/decaffeinate/decaffeinate-example-builder/jobs/${jobId})` :
    '';
  return `\
# decaffeinate fork of ${project}

![Conversion Status](https://decaffeinate-examples.github.io/${project}/conversion-status.svg)
![Test Status](https://decaffeinate-examples.github.io/${project}/test-status.svg)

${jobMessage}

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
