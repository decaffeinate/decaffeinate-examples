module.exports = {
  fileFilterFn: path => !path.includes('test/fixtures'),
  jscodeshiftScripts: [
    'remove-coffee-from-imports.js',
  ],
  searchDirectory: '.',
  filesToProcess: ['./Cakefile'],
  customNames: {
    './Cakefile': './Cakefile.js',
  },
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
