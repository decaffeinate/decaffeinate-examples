module.exports = {
  fileFilterFn: path => !path.includes('test/importing/') && !path.includes('documentation'),
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
};
