import {
    AlbumModel,
    BoardModel,
    CategoryModel,
    ContentModel,
    PhotoModel,
    UserModel,
} from '../models';
import { Op } from 'sequelize';

export function retrieveAlbum(content_id) {
    return new Promise((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null');
        }

        ContentModel.findOne({
            include: [{
                model: AlbumModel,
                as: 'album',
                required: true
            }, {
                model: UserModel,
                required: true,
                attributes: ['user_id', 'nickname', 'introduction', 'profile_path'],
                paranoid: false
            }, {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name', 'lv_read']
            }],
            where: { content_id: content_id }
        })
            .then((albumInfo) => {
                resolve(albumInfo)
            })
            .catch((err) => {
                reject(err);
            })
    })
}


export function retrievePrevAlbum(album_id, board_id) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('board_id can not be null')
        }
        else {
            ContentModel.findOne({
                include: [{
                    model: AlbumModel,
                    as: 'album',
                    required: true,
                }],
                where: {
                    content_id: {
                        [Op.lt]: album_id
                    },
                    board_id: board_id
                },
                order: [
                    ['content_id', 'DESC']
                ]
            })
                .then((album) => {
                    resolve(album);
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}


export function retrieveNextAlbum(album_id, board_id) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('board_id can not be null')
        }
        else {
            ContentModel.findOne({
                include: [{
                    model: AlbumModel,
                    as: 'album',
                    required: true,
                }],
                where: {
                    content_id: {
                        [Op.gt]: album_id
                    },
                    board_id: board_id
                },
                order: [
                    ['content_id', 'ASC']
                ]
            })
                .then((album) => {
                    resolve(album);
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}



export function retrieveAlbumCount(board_id, category_id) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('id can not be null');
        }

        let condition: any = {};
        board_id && (condition.board_id = board_id);
        category_id && (condition.category_id = category_id);

        ContentModel.count({
            include: [{
                model: AlbumModel,
                as: 'album',
                required: true
            }],
            where: condition,
        })
            .then((count) => {
                resolve(count)
            })
            .catch((err) => {
                reject(err)
            })
    })
}


export function retrieveAlbumsInBoard(board_id, rowNum, offset, category_id) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('board_id can not be null');
        }

        let condition: any = {
            board_id: board_id
        };
        category_id && (condition.category_id = category_id);

        ContentModel.findAll({
            include: [{
                model: AlbumModel,
                as: 'album',
                required: true,
                include: [
                    {
                        model: ContentModel,
                        as: 'thumbnail',
                        include: [{
                            model: PhotoModel,
                            as: 'photo',
                            required: true
                        }]
                    }]
            }, {
                model: UserModel,
                required: true,
                attributes: ['nickname', 'deleted_at'],
                paranoid: false
            }, {
                model: CategoryModel
            }, {
                model: ContentModel,
                as: 'children',
                required: false,
                separate: true,
                limit: 1,
                order: [['content_id', 'DESC']],
                include: [{
                    model: PhotoModel,
                    as: 'photo',
                    required: true
                }]
            }],
            where: condition,
            order: [
                ['created_at', 'DESC']
            ],
            limit: rowNum,
            offset: offset
        })
            .then((albums) => {
                resolve(albums);
            })
            .catch((err) => {
                reject(err);
            });
    })
}


export function createAlbum(content_id, data) {
    return new Promise<void>((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null')
        }

        AlbumModel.create({
            content_id: content_id,
            is_private: data.is_private
        })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function updateAlbum(album_id, data) {
    return new Promise<void>((resolve, reject) => {
        if (!album_id) {
            reject('album_id can not be null')
        }

        AlbumModel.update({
            is_private: data.is_private
        },
            {
                where: {
                    content_id: album_id
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

export function updateAlbumThumbnail(album_id, photo_id) {
    return new Promise<void>((resolve, reject) => {
        if (!album_id) {
            reject('album_id can not be null')
        }

        AlbumModel.update({
            tn_photo_id: photo_id
        },
            {
                where: {
                    content_id: album_id
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