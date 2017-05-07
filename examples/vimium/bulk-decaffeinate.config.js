module.exports = {
  searchDirectory: '.',
  filesToProcess: ['./Cakefile'],
  customNames: {
    './Cakefile': './Cakefile.js',
  },
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
