import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const rfs = require('rotating-file-stream');

function pad(num) {
    return (num > 9 ? "" : "0") + num;
}
 
function generator(time, index) {
    if (!time) return "snuaaa.log";
 
    var month = time.getFullYear() + "" + pad(time.getMonth() + 1);
    var day = pad(time.getDate());
    var hour = pad(time.getHours());
    var minute = pad(time.getMinutes());
 
    return month + "/" + month + day + "-" + hour + minute + "-" + index + "-file.log";
}
 
// ensure log directory exists
const logDirectory = path.join('.', 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const logStream = rfs(generator, {
    size: "10M",
    interval: "1d",
    path: logDirectory
});

const logger = morgan('combined', { stream: logStream });

export default logger;