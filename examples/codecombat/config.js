export default {
  cloneUrl: 'https://github.com/codecombat/codecombat.git',
  forkUrl: 'git@github.com:decaffeinate-examples/codecombat.git',
  useDefaultConfig: true,
  extraDependencies: [
    'babel-plugin-transform-remove-strict-mode',
    'babel-loader',
  ],
  testCommands: [`
    set -e
    export COCO_TRAVIS_TEST=1
    export DISPLAY=:99.0
    if [ -e /etc/init.d/xvfb ]; then
      sh -e /etc/init.d/xvfb start
    fi
    rm -rf public
    rm -rf ./node_modules
    source ~/.nvm/nvm.sh
    nvm install 5.10.1
    # Some dependency issues make the install fail the first time, so just try again.
    time npm install || npm install
    # node-sass doesn't get set up correctly for some reason, so set it up again.
    time npm install node-sass
    time npm install request
    time ./node_modules/.bin/bower install
    time ./node_modules/.bin/webpack
    
    node index.js --unittest &
    n=0
    until [ $n -ge 60 ]; do curl http://localhost:3000 && break; n=$[$n+1]; sleep 1; done
    time ./node_modules/karma/bin/karma start --browsers Firefox --single-run --reporters dots
    time npm run jasmine
  `],
  expectConversionSuccess: true,
  expectTestSuccess: true,
};
