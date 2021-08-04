/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-extra-boolean-cast */
const fs = require('fs');
const path = require('path');

const baseFolder = path.join(__dirname, '..', 'downloads');

const createNewFolder = async (dirPath) =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) reject(err);
        resolve();
      });
    }
    resolve();
  });

const initFolderStructure = async (data) => {
  const baseName = !!data.episodes
    ? `${baseFolder}/${data.name}`
    : data.movie.name;

  await createNewFolder(baseFolder);
  await createNewFolder(`${baseFolder}/${baseName}`);

  if (data.episodes) {
    if (!!data.episodes && data.episodes.length) {
      /* for (let i = 0; i < data.episodes.length; i++) {
        await createNewFolder(`${baseName}/${data.episodes[i].title}`);
      } */

      for (const e of data.episodes) {
        await createNewFolder(`${baseName}/${e.title}`);
      }
    }
  }
};
module.exports = { initFolderStructure };
