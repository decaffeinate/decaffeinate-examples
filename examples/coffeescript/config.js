export default {
  cloneUrl: 'https://github.com/jashkenas/coffeescript.git',
  forkUrl: 'git@github.com:decaffeinate-examples/coffeescript.git',
  branch: '1.10.0',
  useDefaultConfig: true,
  // This doesn't cover all tests, just some of them, so don't mark as
  // successful yet.
  testCommand: `
    set -e
    ./node_modules/.bin/babel src -d lib/coffee-script
    git commit -a -m 'Rebuild CoffeeScript with new code'
    ./check-coffeescript-examples.sh
    bin/cake test
  `,
  expectConversionSuccess: true,
  expectTestSuccess: false,
};
