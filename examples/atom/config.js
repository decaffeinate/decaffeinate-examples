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
  testCommand: `
    set -e
    rm -rf node_modules
    export NODE_VERSION=6.9.4 DISPLAY=:99.0 CC=clang CXX=clang++ npm_config_clang=1
    if [ -e /sbin/start-stop-daemon ]; then
      /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
    fi
    script/build --create-debian-package --create-rpm-package --compress-artifacts
    script/test
  `,
  expectConversionSuccess: true,
  expectTestSuccess: true,
};
