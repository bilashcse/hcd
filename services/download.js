const got = require('got');
const { createWriteStream } = require('fs');
const stream = require('stream');
const { promisify } = require('util');
const cliProgress = require('cli-progress');

const pipeline = promisify(stream.pipeline);
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const download = async ({ url, fileName, path, number }) => {
  let currentPercentage = 0;
  const fileNameWithExt = `./downloads/${path}/${
    number ? `${number}_` : ''
  }${fileName.replace(/ /g, '_')}.mp4`;

  const downloadStream = got.stream(url);
  const fileWriterStream = createWriteStream(fileNameWithExt);
  bar.start(100, 0);
  downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);
    if (currentPercentage !== percentage) {
      currentPercentage = percentage;
      bar.update(percentage);
    }
  });
  await pipeline(downloadStream, fileWriterStream);
  bar.stop();
};

module.exports = { download };
