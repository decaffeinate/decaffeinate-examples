import commander from 'commander';

export default function () {
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
    console.log(`TODO: test ${project}`);
  } catch (e) {
    console.error(`Error: ${e}`);
  }
}
