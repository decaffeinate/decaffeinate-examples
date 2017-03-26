export default {
  cloneUrl: 'https://github.com/codecombat/codecombat.git',
  forkUrl: 'git@github.com:decaffeinate-examples/codecombat.git',
  useDefaultConfig: true,
  extraDependencies: [
    'babel-plugin-transform-remove-strict-mode',
  ],
  skipTests: true,
  expectConversionSuccess: true,
  expectTestSuccess: false,
};
