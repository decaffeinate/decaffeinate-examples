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
    # Some dependency issues make the install fail the first time, so just try again.
    npm install || npm install
    # node-sass doesn't get set up correctly for some reason, so set it up again.
    npm install node-sass
    npm install request
    
    ./node_modules/.bin/bower install
    ./node_modules/.bin/webpack
    
    git add -f public/javascripts/test.js
    git commit -m 'Save bad built JS file for diagnostic purposes'
    
    node index.js --unittest &
    n=0
    until [ $n -ge 60 ]; do curl http://localhost:3000 && break; n=$[$n+1]; sleep 1; done
    
    ./node_modules/karma/bin/karma start --browsers Firefox --single-run --reporters dots
    npm run jasmine
  `],
  expectConversionSuccess: true,
  expectTestSuccess: true,
};
