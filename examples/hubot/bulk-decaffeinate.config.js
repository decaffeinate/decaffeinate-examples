module.exports = {
  jscodeshiftScripts: [
    'remove-coffee-from-imports.js',
  ],
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
