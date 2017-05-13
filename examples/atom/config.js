export default {
  cloneUrl: 'https://github.com/atom/atom.git',
  forkUrl: 'git@github.com:decaffeinate-examples/atom.git',
  useDefaultConfig: true,
  extraDependencies: [
    'eslint-config-standard',
    'eslint-plugin-node',
    'eslint-plugin-promise',
    'eslint-plugin-standard',
  ],
  testCommands: [
    'rm -rf node_modules',
    `
    if [ -e /sbin/start-stop-daemon ]; then
      /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
    fi
    `,
    'script/build --create-debian-package --create-rpm-package --compress-artifacts',
    'script/test',
  ],
  expectConversionSuccess: true,
  expectTestSuccess: true,
};
