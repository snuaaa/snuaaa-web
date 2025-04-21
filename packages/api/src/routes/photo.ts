import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrievePhoto, updatePhoto, deletePhoto, retrieveNextPhoto, retrievePrevPhoto, retrievePrevAlbumPhoto, retrieveNextAlbumPhoto, createPhoto } from '../controllers/photo.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { retrieveTagsByContent, createContentTag, deleteContentTag } from '../controllers/contentTag.controller';

const router = express.Router();

router.get('/:photo_id', verifyTokenMiddleware, (req, res, next) => {
    

    let photoInfo = {} as any;
    let likeInfo = {} as any;
    const { decodedToken } = req as any;


    retrievePhoto(req.params.photo_id)
        .then((info) => {
            photoInfo = info;
            if (photoInfo.board.lv_read < decodedToken.grade) {
                const err = {
                    status: 403,
                    code: 4001
                }
                next(err);
                return;
            }
            else {
                return Promise.all([
                    checkLike(req.params.photo_id, decodedToken._id),
                    retrieveTagsOnBoard(photoInfo.board_id),
                    retrievePrevPhoto(req.params.photo_id, photoInfo.parent_id),
                    retrieveNextPhoto(req.params.photo_id, photoInfo.parent_id),
                    retrievePrevAlbumPhoto(photoInfo.parent_id, photoInfo.board_id),
                    retrieveNextAlbumPhoto(photoInfo.parent_id, photoInfo.board_id),
                    increaseViewNum(req.params.photo_id),
                ])
            }
        })
        .then((infos) => {
            if (infos) {
                res.json({
                    photoInfo: photoInfo,
                    likeInfo: infos[0],
                    boardTagInfo: infos[1],
                    // albumPhotosInfo: infos[],
                    prevPhoto: infos[2],
                    nextPhoto: infos[3],
                    prevAlbumPhoto: infos[4],
                    nextAlbumPhoto: infos[5]
                })                    
            } else {
                res.status(404).json();
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        })
})

router.post('/', verifyTokenMiddleware, async (req, res) => {
        
    const decodedToken = (req as any).decodedToken;

    const list = req.body.list;
    const boardId = req.body.board_id;
    const albumId = req.body.album_id;
    
    try {
        const contentIdList = await Promise.all(list.map(async (photo: any) => {
            const contentId = await createPhoto({ ...photo, author_id: decodedToken._id, board_id: boardId, album_id: albumId });
            await Promise.all(photo.tags.map(tag => createContentTag(contentId, tag)))
            return contentId;
        }))
        return res.json({
            success: true,
            list: contentIdList,
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'internal server error',
            code: 0
        });
    }
});

router.patch('/:photo_id', verifyTokenMiddleware, (req, res) => {
    

    try {
        const contentData = {
            title: req.body.title,
            text: req.body.text
        }
        const photoData = req.body.photo;
        const tagData = req.body.tags;

        Promise.all([
            retrieveTagsByContent(req.params.photo_id),
            updateContent(req.params.photo_id, contentData),
            updatePhoto(req.params.photo_id, photoData)
        ])
            .then((infos: any) => {
                const prevTags = infos[0].map(tag => tag.tag_id);
                const newTags = tagData.map(tag => tag.tag_id);
                const updateTag = [];

                if (prevTags && prevTags.length > 0) {
                    prevTags.forEach(tag => {
                        if (!newTags.includes(tag)) {
                            updateTag.concat(deleteContentTag(req.params.photo_id, tag));
                        }
                    });
                }
                if (newTags && newTags.length > 0) {
                    newTags.forEach(tag => {
                        if (!prevTags.includes(tag)) {
                            updateTag.concat(createContentTag(req.params.photo_id, tag));
                        }
                    })
                }
                return Promise.all(updateTag)
            })
            .then(() => {
                res.json({
                    success: true
                })
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({
                    error: 'internal server error',
                    code: 0
                });
            })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'internal server error',
            code: 0
        });
    }

})

router.delete('/:photo_id', verifyTokenMiddleware, (req, res) => {
    
    deletePhoto(req.params.photo_id)
        .then(() => {
            return deleteContent(req.params.photo_id)
        })
        .then(() => {
            return res.json({ success: true });
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        })
})

export default router;