import {
    AttachedFileModel,
    BoardModel,
    ContentModel,
    DocumentModel,
    PostModel,
    UserModel,
} from '../models';
const uuid4 = require('uuid4');
import { Op } from 'sequelize';
import ContentTypeEnum from '../enums/contentTypeEnum';

const SearchTypeEnum = Object.freeze({
    ALL: 'A',
    TITLE: 'T',
    TEXT: 'X',
    USER: 'U'
})

export function retrievePost(content_id) {
    return new Promise((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null');
        }

        ContentModel.findOne({
            include: [{
                model: PostModel,
                as: 'post',
                required: true
            }, {
                model: UserModel,
                required: true,
                attributes: ['user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
                paranoid: false
            },
            {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name', 'lv_read']
            },
            {
                model: AttachedFileModel,
                as: 'attachedFiles',
            }],
            where: { content_id: content_id }
        })
            .then((postInfo) => {
                resolve(postInfo)
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function retrievePostsInBoard(board_id, rowNum, offset) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('id can not be null');
        }

        ContentModel.findAndCountAll({
            include: [{
                model: PostModel,
                as: 'post',
            }, {
                model: UserModel,
                required: true,
                attributes: ['nickname'],
                paranoid: false
            }],
            where: { board_id: board_id },
            order: [
                ['created_at', 'DESC']
            ],
            limit: rowNum,
            offset: offset
        })
            .then((postInfo) => {
                resolve(postInfo);
            })
            .catch((err) => {
                reject(err);
            });
    })
}


export function searchPostsInBoard(board_id, type, keyword, rowNum, offset) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('id can not be null');
        }

        let contentCondition;
        let userCondition;
        if (type === SearchTypeEnum.ALL) {
            contentCondition = {
                board_id: board_id,
                [Op.or]: [{
                    title: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    text: {
                        [Op.like]: `%${keyword}%`
                    }
                }]
            }
        }
        else if (type === SearchTypeEnum.TITLE) {
            contentCondition = {
                board_id: board_id,
                title: {
                    [Op.like]: `%${keyword}%`
                }
            }
        }
        else if (type === SearchTypeEnum.TEXT) {
            contentCondition = {
                board_id: board_id,
                text: {
                    [Op.like]: `%${keyword}%`
                }
            }
        }
        else if (type === SearchTypeEnum.USER) {
            contentCondition = {
                board_id: board_id,
            }
            userCondition = {
                nickname: {
                    [Op.like]: `%${keyword}%`
                }
            }
        }
        else {
            contentCondition = {
                board_id: board_id
            }
        }

        ContentModel.findAndCountAll({
            include: [{
                model: PostModel,
                required: true,
                as: 'post'
            }, {
                model: UserModel,
                required: true,
                attributes: ['nickname'],
                where: userCondition,
                paranoid: false
            }],
            where: contentCondition,
            order: [
                ['created_at', 'DESC']
            ],
            limit: rowNum,
            offset: offset
        })
            .then((postInfo) => {
                resolve(postInfo);
            })
            .catch((err) => {
                reject(err);
            });
    })
}


export function retrieveRecentPosts(grade) {
    return new Promise((resolve, reject) => {

        ContentModel.findAll({
            include: [{
                model: PostModel,
                as: 'post',
            }, {
                model: DocumentModel,
                as: 'document'
            }, {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name'],
                where: {
                    lv_read: {
                        [Op.gte]: grade
                    }
                }
            }],
            where: {
                [Op.or]: [{
                    type: ContentTypeEnum.POST
                }, {
                    type: ContentTypeEnum.DOCUMENT
                }]
            },
            order: [
                ['updated_at', 'DESC']
            ],
            limit: 7
        })
            .then(function (posts) {
                resolve(posts);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export function retrieveAllPosts(grade, rowNum, offset) {
    return new Promise((resolve, reject) => {

        ContentModel.findAndCountAll({
            include: [{
                model: PostModel,
                as: 'post',
                required: true
            }, {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name'],
                where: {
                    lv_read: {
                        [Op.gte]: grade
                    }
                }
            }, {
                model: UserModel,
                required: true,
                attributes: ['nickname'],
                paranoid: false
            }],
            order: [
                ['updated_at', 'DESC']
            ],
            limit: rowNum,
            offset: offset
        })
            .then(function (posts) {
                resolve(posts);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export function retrievePostsByUser(user_id) {
    return new Promise((resolve, reject) => {
        if (!user_id) {
            reject('id can not be null');
        }
        else {
            ContentModel.findAll({
                include: [{
                    model: PostModel,
                    as: 'post',
                    required: true
                }, {
                    model: BoardModel,
                    required: true,
                    attributes: ['board_id', 'board_name']
                },
                ],
                where: {
                    author_id: user_id,
                },
                order: [
                    ['updated_at', 'DESC']
                ],
                limit: 10
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

export function retrievePostsByUserUuid(user_uuid) {
    return new Promise((resolve, reject) => {
        if (!user_uuid) {
            reject('id can not be null');
        }
        else {
            ContentModel.findAll({
                include: [{
                    model: PostModel,
                    as: 'post',
                    required: true,
                }, {
                    model: BoardModel,
                    required: true,
                    attributes: ['board_id', 'board_name']
                },
                {
                    model: UserModel,
                    required: true,
                    attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'profile_path'],
                    where: {
                        user_uuid: user_uuid,
                    }
                }],
                order: [
                    ['updated_at', 'DESC']
                ],
                limit: 10
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


export function retrieveSoundBox() {
    return new Promise((resolve, reject) => {

        ContentModel.findOne({
            attributes: ['content_id', 'title', 'text'],
            include: [{
                model: PostModel,
                as: 'post',
                required: true,
            }, {
                model: BoardModel,
                required: true,
                attributes: [],
            }],
            where: { board_id: 'brd01' },
            order: [
                ['updated_at', 'DESC']
            ],
            limit: 1
        })
            .then(function (post) {
                resolve(post);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export function createPost(data) {
    return new Promise((resolve, reject) => {
        ContentModel.create({
            content_uuid: uuid4(),
            author_id: data.author_id,
            board_id: data.board_id,
            category_id: data.category_id,
            title: data.title,
            text: data.text,
            type: 'PO',
            post: {
            }
        }, {
            include: [{
                model: PostModel,
                as: 'post'
            }]
        })
            .then((content) => {
                resolve(content.getDataValue('content_id'));
            })
            .catch((err) => {
                reject(err);
            })
    })
}