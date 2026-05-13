import {
    CommentLikeModel,
    UserModel,
} from '../models';

export function checkCommentLike(comment_id, user_id) {

    return new Promise((resolve, reject) => {
        if (!user_id || !comment_id) {
            reject('id can not be null')
        }

        CommentLikeModel.findOne({
            where: {
                comment_id: comment_id,
                user_id: user_id
            }
        })
            .then((commentLike) => {
                if (commentLike) {
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

export function likeComment(comment_id, user_id) {

    return new Promise<void>((resolve, reject) => {
        if (!user_id || !comment_id) {
            reject('id can not be null')
        }

        CommentLikeModel.create({
            comment_id: comment_id,
            user_id: user_id
        })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function dislikeComment(comment_id, user_id) {

    return new Promise<void>((resolve, reject) => {
        if (!user_id || !comment_id) {
            reject('id can not be null')
        }

        CommentLikeModel.destroy({
            where: {
                comment_id: comment_id,
                user_id: user_id
            }
        })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err);
            })
    })
}
