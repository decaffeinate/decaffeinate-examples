export default {
  cloneUrl: 'https://github.com/atom/atom.git',
  forkUrl: 'git@github.com:decaffeinate-examples/atom.git',
  useDefaultConfig: true,
  testCommand: 'rm -rf ./node_modules && script/build && script/test',
  expectConversionSuccess: true,
  expectTestSuccess: false,
};
