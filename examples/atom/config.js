export default {
  cloneUrl: 'https://github.com/atom/atom.git',
  forkUrl: 'git@github.com:decaffeinate-examples/atom.git',
  useDefaultConfig: true,
  testCommand: `
    set -e
    script/build --create-debian-package --create-rpm-package --compress-artifacts
    script/test
  `,
  expectConversionSuccess: true,
  expectTestSuccess: false,
};
