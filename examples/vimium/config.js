export default {
  cloneUrl: 'https://github.com/philc/vimium.git',
  forkUrl: 'git@github.com:decaffeinate-examples/vimium.git',
  useDefaultConfig: true,
  extraDependencies: [
    'js-cake',
  ],
  expectConversionSuccess: true,
  expectTestSuccess: false,
  beforeDecaffeinateScript: `
    set -e
    for dir in background_scripts content_scripts lib pages tests/unit_tests tests/dom_tests
    do
      mkdir -p src/\${dir}
      git mv \${dir}/*.coffee src/\${dir}
      touch \${dir}/.gitkeep
      git add \${dir}/.gitkeep
    done
    git commit -m 'Move source files to src directory'
  `,
  testCommand: `
    set -e
    git submodule update --init
    npm install path@0.11
    npm install util
    ./node_modules/.bin/js-cake build
    ./node_modules/.bin/js-cake test
  `,
};
