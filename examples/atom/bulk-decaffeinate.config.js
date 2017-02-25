module.exports = {
  fileFilterFn: path => !path.includes('spec/fixtures'),
  decaffeinateArgs: ['--keep-commonjs', '--prefer-const', '--enable-babel-constructor-workaround'],
  codePrefix: '/** @babel */\n',
};
