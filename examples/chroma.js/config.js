export default {
  cloneUrl: 'https://github.com/gka/chroma.js.git',
  forkUrl: 'git@github.com:decaffeinate-examples/chroma.js.git',
  useDefaultConfig: true,
  extraDependencies: [
    'grunt-cli',
  ],
  expectConversionSuccess: true,
  expectTestSuccess: true,
  testCommands: [`
    set -e
    find src -name '*.js' | xargs sed -i -e 's/\\/\\/ @require\\(.*\\)$/\\/* @require\\1 *\\//g'
    git commit -a -m 'Change catty dependencies to have the proper format'
    
    npm run build
    git commit -a -m 'Rebuild chroma.js'
    npm test
  `],
};
