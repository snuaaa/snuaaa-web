import { ContentTagModel } from '../models';

export function retrieveTagsByContent(content_id) {

    return new Promise((resolve, reject) => {
        if (!content_id) {
            reject('id can not be null')
        }

        ContentTagModel.findAll({
            where: {
                content_id: content_id
            }
        })
            .then((tags) => {
                resolve(tags);
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function createContentTag(content_id, tag_id) {

    return new Promise<void>((resolve, reject) => {
        if (!content_id || !tag_id) {
            reject('id can not be null')
        }

        ContentTagModel.create({
            content_id: content_id,
            tag_id: tag_id
        })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function deleteContentTag(content_id, tag_id) {

    return new Promise<void>((resolve, reject) => {
        if (!content_id || !tag_id) {
            reject('id can not be null')
        }

        ContentTagModel.destroy({
            where: {
                content_id: content_id,
                tag_id: tag_id
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

export function checkContentTag(content_id, tag_id) {

    return new Promise((resolve, reject) => {
        if (!content_id || !tag_id) {
            reject('id can not be null')
        }

        ContentTagModel.findOne({
            where: {
                content_id: content_id,
                tag_id: tag_id
            }
        })
            .then((isExist) => {
                if (isExist) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            })
            .catch((err) => {
                reject(err);
            })

    })
}

export async function updateContentTag(content_id: number, tagList: string[]) {

    const prevTags = await ContentTagModel.findAll({
        where: {
            content_id: content_id
        }
    });
    const prevTagIds = prevTags.map((tag) => tag.get('tag_id') as string);

    const tagsToAdd = tagList.filter((tagId) => !prevTagIds.includes(tagId));
    const tagsToRemove = prevTagIds.filter((tagId) => !tagList.includes(tagId));

    await Promise.all([
        ...tagsToAdd.map((tagId) => createContentTag(content_id, tagId)),
        ...tagsToRemove.map((tagId) => deleteContentTag(content_id, tagId))
    ]);

}