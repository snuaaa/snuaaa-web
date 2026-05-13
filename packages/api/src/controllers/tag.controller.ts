import {
    TagModel,
} from '../models';

export function retrieveTagsOnBoard(board_id) {
    return new Promise((resolve, reject) => {

        if (!board_id) {
            reject('id can not be null');
        }

        TagModel.findAll({
            where: { board_id: board_id },
            order: [['tag_type', 'ASC'], ['tag_id', 'ASC']]
        })
            .then((tags) => {
                resolve(tags);
            })
            .catch((err) => {
                reject(err)
            })
    })
};
