module.exports = {
  searchDirectory: '.',
  filesToProcess: ['./Cakefile'],
  customNames: {
    './Cakefile': './Cakefile.js',
  },
  fileFilterFn: path => !path.includes('test/importing/') && !path.includes('documentation'),
  jscodeshiftScripts: [
    'top-level-this-to-exports.js',
  ],
  decaffeinateArgs: ['--use-cs2'],
};
