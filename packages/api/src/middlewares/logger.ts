import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const rfs = require('rotating-file-stream');

function pad(num) {
  return (num > 9 ? '' : '0') + num;
}

function generator(time, index) {
  if (!time) return 'snuaaa.log';

  const month = time.getFullYear() + '' + pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  const hour = pad(time.getHours());
  const minute = pad(time.getMinutes());

  return month + '/' + month + day + '-' + hour + minute + '-' + index + '-file.log';
}

// ensure log directory exists
const logDirectory = path.join('.', 'log');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// create a rotating write stream
const logStream = rfs(generator, {
  size: '10M',
  interval: '1d',
  path: logDirectory,
});

const logger = morgan('combined', { stream: logStream });

export default logger;
