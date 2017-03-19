export default {
  cloneUrl: 'https://github.com/atom/atom.git',
  forkUrl: 'git@github.com:decaffeinate-examples/atom.git',
  useDefaultConfig: true,
  testCommand: `
    set -e
    export NODE_VERSION=6.9.4 DISPLAY=:99.0 CC=clang CXX=clang++ npm_config_clang=1
    if [ -e /sbin/start-stop-daemon ]; then
      /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
    fi
    git clone https://github.com/creationix/nvm.git /tmp/.nvm
    source /tmp/.nvm/nvm.sh
    nvm install $NODE_VERSION
    nvm use --delete-prefix $NODE_VERSION
    script/build --create-debian-package --create-rpm-package --compress-artifacts
    script/test
  `,
  expectConversionSuccess: true,
  expectTestSuccess: false,
};
