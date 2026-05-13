import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadMiddleware = function(type) {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            if (!(fs.existsSync('./upload/'))) {
                fs.mkdirSync('./upload/');
            }
            if (type === 'EH') {
                if (!(fs.existsSync(path.join('.', 'upload', 'exhibition')))) {
                    fs.mkdirSync(path.join('.', 'upload', 'exhibition'));
                };
                if (!(fs.existsSync(path.join('.', 'upload', 'exhibition', req.body.exhibition_no)))) {
                    fs.mkdirSync(path.join('.', 'upload', 'exhibition', req.body.exhibition_no));
                };
                cb(null, path.join('.', 'upload', 'exhibition', req.body.exhibition_no));
            }
            else if (type === 'PH') {
                if (!(fs.existsSync(path.join('.', 'upload', 'album')))) {
                    fs.mkdirSync(path.join('.', 'upload', 'album'));
                }
                if (req.params.album_id) {
                    if (!(fs.existsSync(path.join('.', 'upload', 'album', req.params.album_id)))) {
                        fs.mkdirSync(path.join('.', 'upload', 'album', req.params.album_id));
                    }
                    cb(null, path.join('.', 'upload', 'album', req.params.album_id))
                }
                else {
                    if (!(fs.existsSync(path.join('.', 'upload', 'album', 'default')))) {
                        fs.mkdirSync(path.join('.', 'upload', 'album', 'default'));
                    };
                    cb(null, path.join('.', 'upload', 'album', 'default'));
                }
            }
            else if (type === 'AF') {
                if (!(fs.existsSync(path.join('.', 'upload', 'file')))) {
                    fs.mkdirSync(path.join('.', 'upload', 'file'));
                }
                if (!(fs.existsSync(path.join('.', 'upload', 'file', req.params.content_id)))) {
                    fs.mkdirSync(path.join('.', 'upload', 'file', req.params.content_id));
                };
                cb(null, path.join('.', 'upload', 'file', req.params.content_id));
            }
            else {
                if (!(fs.existsSync(path.join('.', 'upload', 'default')))) {
                    fs.mkdirSync(path.join('.', 'upload', 'default'));
                };
                cb(null, path.join('.', 'upload', 'default'));
            }
        },
        filename(req, file, cb) {
            let timestamp = (new Date).valueOf()
            cb(null, timestamp + '_' + file.originalname);
        },
    });
    return multer({ storage })
}

export default uploadMiddleware;

