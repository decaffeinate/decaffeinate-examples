import fs from 'fs';
import https from 'https';

export default async function downloadFile(url, dest) {
  let file = fs.createWriteStream(dest);
  let response = await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      resolve(response);
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
