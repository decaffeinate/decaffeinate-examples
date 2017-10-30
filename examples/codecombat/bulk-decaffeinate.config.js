module.exports = {
  jscodeshiftScripts: [
    'remove-coffee-from-imports.js',
  ],
  fileFilterFn: path => !path.includes('bower_components/'),
  skipEslintFix: true,
};
