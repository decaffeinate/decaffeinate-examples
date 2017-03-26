module.exports = {
  jscodeshiftScripts: [
    'remove-coffee-from-imports.js',
  ],
  fileFilterFn: path => !path.includes('bower_components/'),
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
