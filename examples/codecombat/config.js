export default {
  cloneUrl: 'https://github.com/codecombat/codecombat.git',
  forkUrl: 'git@github.com:decaffeinate-examples/codecombat.git',
  useDefaultConfig: true,
  extraDependencies: [
    'babel-plugin-transform-remove-strict-mode',
    'babel-brunch@6.0.0',
  ],
  testCommands: [`
    set -e
    export COCO_TRAVIS_TEST=1
    export DISPLAY=:99.0
    if [ -e /etc/init.d/xvfb ]; then
      sh -e /etc/init.d/xvfb start
    fi
    rm -rf public
    npm install
    
    node index.js --unittest &
    n=0
    until [ $n -ge 60 ]; do curl http://localhost:3000 && break; n=$[$n+1]; sleep 1; done
    
    ./node_modules/karma/bin/karma start --browsers Firefox --single-run --reporters dots
    npm run jasmine
  `],
  expectConversionSuccess: true,
  expectTestSuccess: true,
};
