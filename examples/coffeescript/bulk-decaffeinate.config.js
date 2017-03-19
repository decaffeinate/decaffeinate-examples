module.exports = {
  fileFilterFn: path => !path.includes('test/importing/') && !path.includes('documentation'),
  jscodeshiftScripts: [
    'top-level-this-to-exports.js',
  ],
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
