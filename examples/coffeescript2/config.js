export default {
  cloneUrl: 'https://github.com/jashkenas/coffeescript.git',
  forkUrl: 'git@github.com:decaffeinate-examples/coffeescript2.git',
  useDefaultConfig: true,
  extraDependencies: [
    'babel-plugin-transform-remove-strict-mode',
    'js-cake',
    'require-uncached',
  ],
  testCommands: [`
    set -e
    npm install
    ./node_modules/.bin/babel src -d lib/coffee-script
    git commit -a -m 'Rebuild CoffeeScript with new code'
    ./check-coffeescript-examples.sh
    ./node_modules/.bin/js-cake test
  `],
  expectConversionSuccess: true,
  expectTestSuccess: true,
};
