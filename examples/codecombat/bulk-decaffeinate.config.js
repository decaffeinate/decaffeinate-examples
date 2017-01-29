module.exports = {
  fileFilterFn: path => !path.includes('bower_components/'),
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
