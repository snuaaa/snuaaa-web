import express from 'express';
import path from 'path';

import { verifyTokenMiddleware } from '../middlewares/auth';
import uploadMiddleware from '../middlewares/upload';

import { checkLike, likeContent, dislikeContent } from '../controllers/contentLike.controller';
import { retrieveComments, createComment } from '../controllers/comment.controller';
import { retrieveAttachedFile, increaseDownloadCount, createAttachedFile } from "../controllers/attachedFile.controller";

const router = express.Router();

router.get('/:content_id/comments', verifyTokenMiddleware, (req, res) => {

    const { decodedToken } = req as any;

    retrieveComments(req.params.content_id, decodedToken._id)
        .then((comments) => {
            res.json(comments)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'INTERNAL SERVER ERROR'
            });
        })
})

router.get('/:content_id/file/:file_id', (req, res) => {


    retrieveAttachedFile(req.params.file_id)
        .then((file: any) => {
            increaseDownloadCount(req.params.file_id)
            res.download(file.file_path, file.original_name);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'INTERNAL SERVER ERROR'
            });
        })
})

router.post('/:content_id/file',
    verifyTokenMiddleware,
    uploadMiddleware('AF').single('attachedFile'),
    (req, res) => {

        const { file } = req as any;

        try {
            if (!file) {
                res.status(409).json({
                    error: 'FILE IS NOT ATTACHED',
                    code: 1
                });
            }
            else {
                let file_type = ''
                let extention = path.extname(file.path).substr(1);
                if (['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'].includes(extention)) {
                    file_type = 'IMG';
                }
                else if (['doc', 'DOC', 'docx', 'DOCX'].includes(extention)) {
                    file_type = 'DOC';
                }
                else if (['xls', 'XLS', 'xlsx', 'XLSX'].includes(extention)) {
                    file_type = 'XLS';
                }
                else if (['ppt', 'PPT', 'pptx', 'PPTX'].includes(extention)) {
                    file_type = 'PPT';
                }
                else if (['pdf', 'PPT'].includes(extention)) {
                    file_type = 'PDF';
                }
                else if (['hwp', 'HWP'].includes(extention)) {
                    file_type = 'HWP';
                }
                else if (['zip', 'ZIP'].includes(extention)) {
                    file_type = 'ZIP';
                }
                else {
                    file_type = 'N';
                    console.error(extention)
                }
                let data = {
                    original_name: file.originalname,
                    file_path: file.path,
                    file_type: file_type
                }
                createAttachedFile(req.params.content_id, data)
                    .then(() => {
                        res.json({ success: true });
                    })
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: 'INTERNAL SERVER ERROR',
                code: 0
            })
        }
    }
)

router.post('/:content_id/comment', verifyTokenMiddleware, (req, res) => {
    
    const { decodedToken } = req as any;

    createComment(decodedToken._id, req.params.content_id, req.body)
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error(err);
            return res.status(403).json({
                success: false,
                message: err.message
            })
        });
});

router.post('/:content_id/like', verifyTokenMiddleware, (req, res) => {

    const { decodedToken } = req as any;
    const content_id = req.params.content_id;
    let user_id = decodedToken._id

    checkLike(content_id, user_id)
        .then((isLiked) => {
            if (isLiked) {
                return dislikeContent(content_id, user_id)
            }
            else {
                return likeContent(content_id, user_id)
            }
        })
        // .then(() => {
        //     return updateLikeNum(content_id)
        // })
        .then(() => {
            res.json({ success: true });
        })
        .catch((err) => {
            console.error(err);
            return res.status(403).json({
                success: false,
            })
        })
});

export default router;