import {
    CategoryModel,
} from '../models';

export function retrieveCategoryByBoard(board_id) {
    return new Promise((resolve, reject) => {
        if (!board_id) {
            reject('id can not be null');
        }

        CategoryModel.findAll({
            where: { board_id: board_id }
        })
            .then((categories) => {
                resolve(categories);
            })
            .catch((err) => {
                reject(err);
            });
    })
}
