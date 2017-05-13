import moment from 'moment';
import 'moment-precise-range-plugin';
import { spawn } from 'child_process';

/**
 * Variant of exec that connects stdout, stderr, and stdin, mostly so console
 * output is shown continuously. As with the mz version of exec, this returns a
 * promise that resolves when the shell command finishes.
 *
 * Taken directly from execLive in bulk-decaffeinate.
 */
export default function run(command) {
  let startTime = moment();
  console.log(`Time: ${startTime.format()}`);
  console.log(`> ${command}`);
  return new Promise((resolve, reject) => {
    let childProcess = spawn('/bin/bash', ['-c', command], {stdio: 'inherit'});
    childProcess.on('close', code => {
      console.log(`Time taken: ${startTime.preciseDiff() || '0 seconds'}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed: ${command}`));
      }
    });
  });
}
