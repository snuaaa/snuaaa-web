import {
    BoardModel,
    CommentLikeModel,
    CommentModel,
    ContentModel,
    UserModel,
} from '../models';
import { Op } from 'sequelize';

export function retrieveComments(parent_id, user_id) {
    return new Promise((resolve, reject) => {
        if (!parent_id || !user_id) {
            reject('id can not be null');
        }

        CommentModel.findAll({
            include: [{
                model: UserModel,
                required: true,
                attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
                paranoid: false
            },
            {
                model: UserModel,
                // through: CommentLikeModel,
                as: 'likeUsers',
                attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
                paranoid: false
            },
            {
                model: CommentModel,
                as: 'children',
                include: [{
                    model: UserModel,
                    required: true,
                    attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
                    paranoid: false
                },
                {
                    model: UserModel,
                    // through: CommentLikeModel,
                    as: 'likeUsers',
                    attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
                    paranoid: false
                }],
            }],
            where: {
                parent_id: parent_id,
                parent_comment_id: null
            },
            order: [['created_at', 'asc'], ['children', 'created_at']]
        })
            .then((comments) => {
                resolve(comments)
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function retrieveRecentComments() {
    return new Promise((resolve, reject) => {

        CommentModel.findAll({
            include: [{
                model: ContentModel,
                required: true,
                include: [{
                    model: BoardModel,
                    required: true,
                    attributes: ['board_id', 'board_name']
                }]
            }],
            order: [['created_at', 'DESC']],
            limit: 5
        })
            .then((comments) => {
                resolve(comments);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export function retrieveAllComments(grade, rowNum, offset) {
    return new Promise((resolve, reject) => {

        CommentModel.findAndCountAll({
            include: [{
                model: ContentModel,
                required: true,
                include: [{
                    model: BoardModel,
                    required: true,
                    attributes: ['board_id', 'board_name'],
                    where: {
                        lv_read: {
                            [Op.gte]: grade
                        }
                    }
                }]
            }],
            order: [['created_at', 'DESC']],
            limit: rowNum,
            offset: offset
        })
            .then((comments) => {
                resolve(comments);
            })
            .catch((err) => {
                reject(err)
            })
    })
}


export function retrieveCommentsByUser(user_id) {
    return new Promise((resolve, reject) => {
        if (!user_id) {
            reject('id can not be null');
        }
        else {
            CommentModel.findAll({
                include: [{
                    model: ContentModel,
                    required: true,
                    include: [{
                        model: BoardModel,
                        required: true,
                        attributes: ['board_id', 'board_name']
                    }]
                }],
                where: {
                    author_id: user_id,
                },
                order: [['created_at', 'DESC']],
                limit: 15
            })
                .then(function (posts) {
                    resolve(posts);
                })
                .catch((err) => {
                    reject(err)
                })
        }
    })
};


export function retrieveCommentsByUserUuid(user_uuid) {
    return new Promise((resolve, reject) => {
        if (!user_uuid) {
            reject('user_uuid can not be null');
        }
        else {
            CommentModel.findAll({
                include: [{
                    model: ContentModel,
                    required: true,
                    include: [{
                        model: BoardModel,
                        required: true,
                        attributes: ['board_id', 'board_name']
                    }]
                },
                {
                    model: UserModel,
                    required: true,
                    attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'profile_path'],
                    where: {
                        user_uuid: user_uuid,
                    }
                }],
                order: [['created_at', 'DESC']],
                limit: 15
            })
                .then(function (posts) {
                    resolve(posts);
                })
                .catch((err) => {
                    reject(err)
                })
        }
    })
};


export function createComment(user_id, parent_id, data) {
    return new Promise((resolve, reject) => {
        if (!user_id || !parent_id) {
            reject('id can not be null')
        }

        let comment_id = ''
        CommentModel.create({
            parent_id: parent_id,
            parent_comment_id: data.parent_comment_id ? data.parent_comment_id : null,
            author_id: user_id,
            text: data.text
        })
            .then((comment) => {
                comment_id = comment.getDataValue('comment_id');
                return ContentModel.increment('comment_num',
                    {
                        where: { content_id: parent_id },
                        silent: true
                    }
                )
            })
            .then(() => {
                resolve(comment_id)
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function updateComment(comment_id, data) {
    return new Promise<void>((resolve, reject) => {
        if (!comment_id) {
            reject('id can not be null')
        }

        CommentModel.update({
            text: data.text,
        },
            {
                where: {
                    comment_id: comment_id
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

export function deleteComment(comment_id) {
    return new Promise<void>((resolve, reject) => {
        if (!comment_id) {
            reject('id can not be null')
        }

        CommentModel.findOne({
            where: {
                comment_id: comment_id
            }
        })
            .then((comment) => {
                return ContentModel.decrement('comment_num', {
                    where: {
                        content_id: comment.getDataValue('parent_id'),
                    },
                    silent: true
                })
            })
            .then(() => {
                return CommentModel.destroy(
                    {
                        where: {
                            comment_id: comment_id
                        }
                    })
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    })
}

