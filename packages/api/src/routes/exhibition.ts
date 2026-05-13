import express from 'express';
import path from 'path';
const uuid4 = require('uuid4');
import uploadMiddleware from '../middlewares/upload';
import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrieveExhibition } from '../controllers/exhibition.controller';
import { createExhibitPhoto, retrieveExhibitPhotosInExhibition } from '../controllers/exhibitPhoto.controller';
import { resizeForThumbnail } from '../lib/resize';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { deleteContent } from '../controllers/content.controller';

const router = express.Router();

router.get('/:exhibition_id', verifyTokenMiddleware, (req, res) => {
    
    retrieveExhibition(req.params.exhibition_id)
        .then((exhibitionInfo) => {
            res.json({
                exhibitionInfo: exhibitionInfo
            })
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: 'RETRIEVE EXHIBITION FAIL',
                code: 0
            });
        })
})

router.patch('/:exhibition_id', verifyTokenMiddleware, (req, res) => {
    

})


router.delete('/:exhibition_id', verifyTokenMiddleware, (req, res) => {
    deleteContent(req.params.exhibition_id)
        .then(() => {
            return res.json({ success: true });
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json({
                error: 'DELETE ALBUM FAIL',
                code: 1
            })
        })
})


router.get('/:exhibition_id/exhibitPhotos', verifyTokenMiddleware, (req, res) => {
    

    retrieveExhibitPhotosInExhibition(req.params.exhibition_id)
        .then((exhibitPhotosInfo) => {
            res.json({
                exhibitPhotosInfo: exhibitPhotosInfo
            })
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: 'RETRIEVE EXHIBITION FAIL',
                code: 0
            });
        })
})

router.post('/:exhibition_id/exhibitPhoto',
    verifyTokenMiddleware,
    uploadMiddleware('EH').single('exhibitPhoto'),
    (req, res) => {
        
        const { file, decodedToken } = req as any;

        if (!file) {
            res.status(409).json({
                error: 'EXHIBITPHOTO IS NOT ATTACHED',
                code: 1
            });
        }

        else {
            let basename = path.basename(file.filename, path.extname(file.filename));
            const photoInfo = JSON.parse(req.body.photoInfo)

            resizeForThumbnail(file.path, null)
                .then(() => {
                    if(photoInfo.photographer.user_uuid) {
                        return retrieveUserByUserUuid(photoInfo.photographer.user_uuid)
                    }
                })
                .then((photographer: any) => {
                    // console.log(photographer)

                    let data = {
                        content_uuid: uuid4(),
                        author_id: decodedToken._id,
                        board_id: req.body.board_id,
                        category_id: req.body.category_id,
                        title: photoInfo.title,
                        text: photoInfo.text,
                        type: 'EP',
                        parent_id: req.params.exhibition_id,
                        order: photoInfo.order,
                        photographer_id: photographer ? photographer.user_id : null,
                        photographer_alt: photographer ? null : photoInfo.photographer_alt,
                        file_path: `/exhibition/${req.body.exhibition_no}/${file.filename}`,
                        thumbnail_path: `/exhibition/${req.body.exhibition_no}/${basename}_thumb.jpeg`,
                        location: photoInfo.location,
                        camera: photoInfo.camera,
                        lens: photoInfo.lens,
                        exposure_time: photoInfo.exposure_time,
                        focal_length: photoInfo.focal_length,
                        f_stop: photoInfo.f_stop,
                        iso: photoInfo.iso,
                        date: photoInfo.date ? new Date(photoInfo.date) : null
                    }
                    return createExhibitPhoto(data)
                })
                .then(() => {
                    return res.json({ success: true });
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({
                        error: 'INTERNAL SERVER ERROR',
                        code: 0
                    });
                })
        }
    })


export default router;