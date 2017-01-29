import pty from 'pty.js';

/**
 * Variant of exec that both forwards stdout to the console and captures it.
 * We need to pretend to be a TTY so that things like `git clone` will show the
 * proper output.
 */
export default function run(command) {
  console.log(`> ${command}`);
  return new Promise((resolve, reject) => {
    let childProcess = pty.spawn('/bin/sh', ['-c', command]);
    // Combined stdout and stderr.
    let output = '';

    childProcess.on('data', (data) => {
      process.stdout.write(data);
      output += data;
    });

    childProcess.on('exit', (code) => {
      let result = {
        code,
        output,
      };
      if (code === 0) {
        resolve(result);
      } else {
        reject(new Error(`CLI error. Output: ${output}`));
      }
    });
  });
}
