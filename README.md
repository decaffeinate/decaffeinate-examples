# decaffeinate-examples

A tool that can automatically run [decaffeinate] on the latest version of
various open source projects.

[decaffeinate]: https://github.com/decaffeinate/decaffeinate

## Example usage

```
npm install -g bulk-decaffeinate decaffeinate eslint
git clone https://github.com/decaffeinate/decaffeinate-examples
cd decaffeinate-examples
npm install
bin/example-runner hubot
```

This will clone the hubot repo, configure it to allow JS files, convert the
project to JS using decaffeinate, and run all tests. If all goes well, all files
should convert successfully and all tests should pass.

## Adding new projects

A new project can be added by adding a new subdirectory to the
[examples](./examples) directory. Each project should have the following:
* A file called `config.js` exporting an object. That object should have a
  `cloneUrl` field with the clone URL of the relevant repo, an
  `extraDependencies` field for any additional packages to `npm install`, and
  can opt into a "default config" that installs babel and eslint with
  reasonable defaults.
* A `bulk-decaffeinate.config.js` file that will be used for the decaffeinate
  process.
* A file called `decaffeinate.patch` that applies a patch to the repo so that
  tests can be run in JavaScript using `npm test`.

In general, this format is designed to be easy to read and modify; the patch
file should hopefully be as minimal as possible.
