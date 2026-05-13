import {
    AttachedFileModel,
} from '../models';

export function createAttachedFile(content_id, data) {
    return new Promise<void>((resolve, reject) => {

        if (!content_id) {
            reject('id can not be null')
        }
        else {
            AttachedFileModel.create({
                parent_id: content_id,
                original_name: data.original_name,
                file_path: data.file_path,
                file_type: data.file_type
            })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}

export function retrieveAttachedFile(file_id) {
    return new Promise((resolve, reject) => {
        if (!file_id) {
            reject('id can not be null')
        }
        else {
            AttachedFileModel.findOne({
                attributes: ['file_id', 'original_name', 'file_path', 'file_type'],
                where: { file_id: file_id }
            })
                .then((file) => {
                    resolve(file);
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}

export function retrieveAttachedFilesInContent(content_id) {
    return new Promise((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null')
        }
        else {
            AttachedFileModel.findAll({
                attributes: ['file_id', 'original_name', 'file_type', 'download_count'],
                where: { parent_id: content_id },
                order: [
                    ['file_id', 'ASC']
                ]
            })
                .then((files) => {
                    resolve(files);
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}

export function increaseDownloadCount(file_id) {
    return new Promise<void>((resolve, reject) => {
        if (!file_id) {
            reject('file_id can not be null')
        }

        AttachedFileModel.increment('download_count',
            {
                where: { file_id: file_id },
                silent: true
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function deleteAttachedFile(file_id) {
    return new Promise<void>((resolve, reject) => {
        if (!file_id) {
            reject('file_id can not be null')
        }
        else {
            AttachedFileModel.destroy({
                where: {
                    file_id: file_id
                }
            })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}
