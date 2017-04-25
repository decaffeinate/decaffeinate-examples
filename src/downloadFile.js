import fs from 'fs';
import https from 'https';

async function tryDownloadFile(url, dest) {
  let file = fs.createWriteStream(dest);
  let response = await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode < 400) {
        resolve(response);
      } else {
        reject(new Error('Error downloading file.'));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
  response.pipe(file);
  await new Promise((resolve, reject) => {
    file.on('finish', () => {
      file.close();
      resolve();
    });
    file.on('error', (err) => {
      reject(err);
    });
  });
}

export default async function downloadFile(url, dest) {
  for (let i = 0; i < 5; i++) {
    console.log(`Dowloading ${url}...`);
    try {
      await tryDownloadFile(url, dest);
      console.log('Success.');
      return;
    } catch (e) {
      console.log('Error. Retrying...');
    }
  }
  throw new Error(`Download of ${url} failed after 5 attempts.`);
}
