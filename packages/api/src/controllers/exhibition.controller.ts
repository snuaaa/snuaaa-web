import {
    BoardModel,
    ContentModel,
    ExhibitionModel,
    UserModel,
} from '../models';

export function retrieveExhibition(exhibition_id) {
    return new Promise((resolve, reject) => {
        if (!exhibition_id) {
            reject('exhibition_id can not be null');
        }

        ContentModel.findOne({
            include: [{
                model: ExhibitionModel,
                as: 'exhibition',
                // require: true
            }, {
                model: UserModel,
                required: true,
                attributes: ['user_id', 'nickname', 'introduction', 'profile_path', 'deleted_at'],
                paranoid: false
            },
            {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name', 'lv_read', 'lv_write']
            }],
            where: { content_id: exhibition_id }
        })
            .then((exhibitionInfo) => {
                resolve(exhibitionInfo);
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function retrieveExhibitions() {
    return new Promise((resolve, reject) => {
        ContentModel.findAll({
            include: [{
                model: ExhibitionModel,
                as: 'exhibition',
                required: true
            }, {
                model: UserModel,
                required: true,
                attributes: ['user_id', 'nickname', 'introduction', 'profile_path', 'deleted_at'],
                paranoid: false
            }, {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name', 'lv_read']
            }
            ],
            order: [
                ['exhibition', 'exhibition_no', 'DESC']
            ]
        })
            .then((exhibitionInfo) => {
                resolve(exhibitionInfo)
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function createExhibition(content_id, data) {
    return new Promise<void>((resolve, reject) => {

        if (!content_id) {
            reject('content_id can not be null')
        }
        else {
            ExhibitionModel.create({
                content_id: content_id,
                exhibition_no: data.exhibition_no,
                slogan: data.slogan,
                date_start: data.date_start,
                date_end: data.date_end,
                place: data.place,
                poster_path: data.poster_path,
                poster_thumbnail_path: data.poster_thumbnail_path
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
