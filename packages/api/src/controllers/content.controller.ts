import {
    ContentModel,
} from '../models';
const uuid4 = require('uuid4');

export function createContent(user_id, board_id, data, type) {
    return new Promise((resolve, reject) => {
        if (!user_id || !board_id) {
            reject('id can not be null')
        }

        ContentModel.create({
            content_uuid: uuid4(),
            author_id: user_id,
            board_id: board_id,
            category_id: data.category_id,
            title: data.title,
            text: data.text,
            type: type
        })
            .then((content) => {
                resolve(content.getDataValue('content_id'));
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function updateContent(content_id, data) {
    return new Promise<void>((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null')
        }

        ContentModel.update({
            title: data.title,
            text: data.text,
            category_id: data.category_id
        },
            {
                where: {
                    content_id: content_id
                }
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function deleteContent(content_id) {
    return new Promise<void>((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null')
        }

        ContentModel.destroy(
            {
                where: {
                    content_id: content_id
                }
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function increaseViewNum(content_id) {
    return new Promise<void>((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null')
        }

        ContentModel.increment('view_num',
            {
                where: { content_id: content_id },
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
