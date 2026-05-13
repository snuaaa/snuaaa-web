import express from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrieveExhibitPhoto, updateExhibitPhoto, deleteExhibitPhoto, retrieveExhibitPhotosInExhibition } from '../controllers/exhibitPhoto.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { increaseViewNum, updateContent, deleteContent } from '../controllers/content.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';

const router = express.Router();

router.get('/:exhibitPhoto_id', verifyTokenMiddleware, (req, res) => {
    
    const { decodedToken } = req as any;

    try {
        let exhibitPhotoInfo: any = {};
        retrieveExhibitPhoto(req.params.exhibitPhoto_id)
            .then((info) => {
                exhibitPhotoInfo = info;
                return Promise.all([
                    checkLike(req.params.exhibitPhoto_id, decodedToken._id),
                    retrieveExhibitPhotosInExhibition(exhibitPhotoInfo.parent_id),
                    increaseViewNum(req.params.exhibitPhoto_id)
                ])
            })
            .then((infos) => {
                res.json({
                    exhibitPhotoInfo: exhibitPhotoInfo,
                    likeInfo: infos[0],
                    exhibitPhotosInfo: infos[1]
                })
            })
            .catch((err) => {
                console.error(err)
                res.status(500).json({
                    error: 'internal server error',
                    code: 0
                })
            })
    }
    catch (err) {
        console.error(err)
        res.status(500).json({
            error: 'internal server error',
            code: 0
        })
    }

})

router.patch('/:exhibitPhoto_id', verifyTokenMiddleware, (req, res) => {
    
    try {
        new Promise<void>((resolve, reject) => {
            if (req.body.photographer) {
                retrieveUserByUserUuid(req.body.photographer.user_uuid)
                .then((photographer: any) => {
                    resolve(photographer);
                })
                .catch((err) => {
                    reject(err);
                })
            }
            else {
                resolve();
            }
        })
            .then((photographer: any) => {
                let data = {
                    title: req.body.title,
                    text: req.body.text,
                    order: req.body.order,
                    photographer_id: photographer ? photographer.user_id : null,
                    photographer_alt: photographer ? null : req.body.photographer_alt,
                    location: req.body.location,
                    camera: req.body.camera,
                    lens: req.body.lens,
                    exposure_time: req.body.exposure_time,
                    focal_length: req.body.focal_length,
                    f_stop: req.body.f_stop,
                    iso: req.body.iso,
                    date: req.body.date ? new Date(req.body.date) : null
                }
                Promise.all([
                    updateContent(req.params.exhibitPhoto_id, data),
                    updateExhibitPhoto(req.params.exhibitPhoto_id, data)
                ])
            })
            .then(() => {
                res.json({
                    success: true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({
                    error: 'UPDATE FAIL',
                    code: 0
                });    
            })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'UPDATE FAIL',
            code: 0
        });    

    }

})


router.delete('/:exhibitPhoto_id', verifyTokenMiddleware, (req, res) => {
    
    try {
        deleteExhibitPhoto(req.params.exhibitPhoto_id)
            .then(() => {
                return deleteContent(req.params.exhibitPhoto_id)
            })
            .then(() => {
                res.json({
                    success: true
                })
            })
            .catch((err) => {
                console.error(err)
                res.status(500).json({
                    error: 'internal server error',
                    code: 0
                })
            })
    }
    catch (err) {
        console.error(err)
        res.status(500).json({
            error: 'internal server error',
            code: 0
        })
    }

})




export default router;