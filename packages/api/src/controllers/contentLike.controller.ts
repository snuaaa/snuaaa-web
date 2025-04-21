import { ContentLikeModel, ContentModel } from '../models';

export function checkLike(content_id, user_id) {

    return new Promise((resolve, reject) => {
        if (!user_id || !content_id) {
            reject('id can not be null')
        }

        ContentLikeModel.findOne({
            where: {
                content_id: content_id,
                user_id: user_id
            }
        })
            .then((contentLike) => {
                if (contentLike) {
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function likeContent(content_id, user_id) {

    return new Promise<void>((resolve, reject) => {
        if (!user_id || !content_id) {
            reject('id can not be null')
        }

        ContentLikeModel.create({
            content_id: content_id,
            user_id: user_id
        })
            .then(() => {
                ContentModel.increment('like_num',
                    {
                        where: { content_id: content_id },
                        silent: true
                    })
            })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function dislikeContent(content_id, user_id) {

    return new Promise<void>((resolve, reject) => {
        if (!user_id || !content_id) {
            reject('id can not be null')
        }

        ContentLikeModel.destroy({
            where: {
                content_id: content_id,
                user_id: user_id
            }
        })
            .then(() => {
                ContentModel.decrement('like_num',
                    {
                        where: { content_id: content_id },
                        silent: true
                    })
            })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err);
            })
    })
}
