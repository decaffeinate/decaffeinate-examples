export default {
  cloneUrl: 'https://github.com/jashkenas/coffeescript.git',
  forkUrl: 'git@github.com:decaffeinate-examples/coffeescript.git',
  branch: '1.10.0',
  useDefaultConfig: true,
  // This doesn't cover all tests, just some of them, so don't mark as
  // successful yet.
  testCommand: 'bin/cake test && `exit 1`',
  expectConversionSuccess: true,
  expectTestSuccess: false,
};
