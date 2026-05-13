import {
    AttachedFileModel,
    BoardModel,
    CategoryModel,
    ContentModel,
    DocumentModel,
    UserModel,
} from '../models';

export function retrieveDocument(doc_id) {
    return new Promise((resolve, reject) => {
        if (!doc_id) {
            reject('id can not be null')
        }

        ContentModel.findOne({
            include: [{
                model: DocumentModel,
                as: 'document',
                required: true,
            }, {
                model: UserModel,
                required: true,
                attributes: ['user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
                paranoid: false
            }, {
                model: BoardModel,
                required: true,
                attributes: ['board_id', 'board_name', 'lv_read']
            }, {
                model: AttachedFileModel,
                as: 'attachedFiles',
                separate: true
            }],
            where: { content_id: doc_id }
        })
            .then((docInfo) => {
                resolve(docInfo)
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function retrieveDocumentCount(category_id, generation) {
    return new Promise((resolve, reject) => {

        let contentCondition: any = {};
        let docCondition: any = {};
        category_id && (contentCondition.category_id = category_id);
        generation && (docCondition.generation = generation);

        DocumentModel.count({
            include: [{
                model: ContentModel,
                as: 'content',
                required: true,
                include: [{
                    model: UserModel,
                    required: true,
                    attributes: ['nickname', 'deleted_at'],
                    paranoid: false
                }, {
                    model: CategoryModel,
                    required: true,
                    attributes: ['category_name']
                }],
                where: contentCondition
            }],
            where: docCondition,
        })
            .then((count) => {
                resolve(count)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export function retrieveDocuments(rowNum, offset, category_id, generation) {
    return new Promise((resolve, reject) => {

        let contentCondition: any = {};
        let docCondition: any = {};
        category_id && (contentCondition.category_id = category_id);
        generation && (docCondition.generation = generation);

        DocumentModel.findAll({
            include: [{
                model: ContentModel,
                as: 'content',
                required: true,
                attributes: ['content_id', 'title', 'text'],
                include: [{
                    model: UserModel,
                    required: true,
                    attributes: ['nickname', 'deleted_at'],
                    paranoid: false
                }, {
                    model: CategoryModel,
                    required: true,
                    attributes: ['category_name']
                }, {
                    model: AttachedFileModel,
                    as: 'attachedFiles',
                    separate: true
                }],
                where: contentCondition
            }],
            attributes: ['content_id', 'generation'],
            where: docCondition,
            limit: rowNum,
            offset: offset,
            order: [
                [{
                    model: ContentModel,
                    as: 'content'
                },
                    'updated_at', 'DESC'
                ]
            ]
        })
            .then((docInfo) => {
                resolve(docInfo)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export function createDocument(data) {
    return new Promise((resolve, reject) => {

        ContentModel.create({
            content_uuid: data.content_uuid,
            author_id: data.author_id,
            board_id: data.board_id,
            category_id: data.category_id,
            title: data.title,
            text: data.text,
            type: data.type,
            document: {
                generation: data.generation
            }
        }, {
            include: [{
                model: DocumentModel,
                as: 'document',
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

export function deleteDocument(doc_id) {
    return new Promise<void>((resolve, reject) => {

        if (!doc_id) {
            reject('id can not be null')
        }
        else {
            DocumentModel.destroy({
                where: {
                    content_id: doc_id
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