import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import uploadMiddleware from '../middlewares/upload';
import { verifyTokenMiddleware } from '../middlewares/auth';
import { retrieveBoard, retrieveBoardsCanAccess } from '../controllers/board.controller';
import { retrieveCategoryByBoard } from '../controllers/category.controller';
import { createContent } from '../controllers/content.controller';
import { retrievePostsInBoard, createPost, searchPostsInBoard } from '../controllers/post.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { createDocument } from '../controllers/document.controller';
import { createAttachedFile } from '../controllers/attachedFile.controller';
import { retrieveExhibitions, createExhibition } from '../controllers/exhibition.controller';
import { resizeForThumbnail } from '../lib/resize';
const uuid4 = require('uuid4');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!(fs.existsSync('./upload/file'))) {
            fs.mkdirSync('./upload/file')
        }
        cb(null, './upload/file/')
    },
    filename(req, file, cb) {
        let timestamp = (new Date).valueOf()
        cb(null, timestamp + '_' + file.originalname);
    },
});

const upload = multer({ storage })

router.get('/', verifyTokenMiddleware, (req, res) => {
    
    const decodedToken = (req as any).decodedToken;
    retrieveBoardsCanAccess(decodedToken.grade)
        .then((boardInfo) => {
            return res.json(boardInfo)
        })
        .catch((err) => {
            console.error(err);
            return res.status(403).json({
                success: false
            })
        })
})

router.get('/:board_id', verifyTokenMiddleware, (req, res, next) => {

    const decodedToken = (req as any).decodedToken;

    try {
        retrieveBoard(req.params.board_id)
            .then((boardInfo: any) => {
                if (boardInfo.lv_read < decodedToken.grade) {
                    const err = {
                        status: 403,
                        code: 4001
                    }
                    next(err);
                }
                else {
                    res.json({
                        boardInfo: boardInfo
                    })
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({
                    error: 'internal server error',
                    code: 0
                })
            })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'internal server error',
            code: 0
        })
    }
})

router.get('/:board_id/posts', verifyTokenMiddleware, (req, res) => {
    

    let offset = 0;
    const ROWNUM = 10;
    const query = (req as any).query;
    if (query.page > 0) {
        offset = ROWNUM * (query.page - 1);
    }

    retrievePostsInBoard(req.params.board_id, ROWNUM, offset)
        .then((postInfo) => {
            res.json({
                postCount: (postInfo as any).count,
                postInfo: (postInfo as any).rows
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(403).json({
                success: false,
                error: 'RETRIEVE POST FAIL',
                code: 1
            })
        })
})

router.get('/:board_id/posts/search', verifyTokenMiddleware, (req, res) => {
    

    let offset = 0;
    const ROWNUM = 10;
    const query = (req as any).query;

    if (query.page > 0) {
        offset = ROWNUM * (query.page - 1);
    }

    searchPostsInBoard(req.params.board_id, req.query.type, req.query.keyword, ROWNUM, offset)
        .then((postInfo) => {
            res.json({
                postCount: (postInfo as any).count,
                postInfo: (postInfo as any).rows
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(403).json({
                success: false,
                error: 'RETRIEVE POST FAIL',
                code: 1
            })
        })
})


router.get('/:board_id/tags', verifyTokenMiddleware, (req, res) => {
    

    retrieveTagsOnBoard(req.params.board_id)
        .then((tags) => {
            res.json(tags)
        })
        .catch((err) => {
            console.error(err);
            res.status(403).json({
                success: false,
                error: 'RETRIEVE POST FAIL',
                code: 1
            })
        })
})


router.post('/:board_id/post', verifyTokenMiddleware, (req, res) => {
    
    const decodedToken = (req as any).decodedToken;

    let postData = {
        ...req.body,
        author_id: decodedToken._id,
        board_id: req.params.board_id
    }

    createPost(postData)
        .then((content_id) => {
            res.json({
                content_id: content_id,
                success: true
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(403).json({
                success: false,
                error: 'RETRIEVE POST FAIL',
                code: 1
            })
        });
});


router.post('/:board_id/document', verifyTokenMiddleware, (req, res) => {
    
    const decodedToken = (req as any).decodedToken;

    try {
        let user_id = decodedToken._id;

        let data = {
            content_uuid: uuid4(),
            author_id: user_id,
            board_id: req.params.board_id,
            category_id: req.body.category_id,
            title: req.body.title,
            text: req.body.text,
            type: 'DO',
            generation: req.body.generation ? req.body.generation : null
        }

        createDocument(data)
            .then((content_id) => {
                return res.json({
                    content_id: content_id,
                    success: true
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(403).json({
                    success: false,
                    error: 'RETRIEVE POST FAIL',
                    code: 1
                })
            });

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'INTERNAL SERVER ERROR',
            code: 0
        })
    }
})

router.get('/:board_id/exhibitions', verifyTokenMiddleware, (req, res) => {
    

    retrieveExhibitions()
        .then((exhibitionInfo) => {
            res.json(exhibitionInfo)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                success: false,
                error: 'RETRIEVE EXHIBITIONS FAIL',
                code: 1
            })
        })
})

router.post('/:board_id/exhibition',
    verifyTokenMiddleware,
    uploadMiddleware('EH').single('poster'),
    (req, res) => {
        
        const decodedToken = (req as any).decodedToken;
        const file = (req as any).file;

        if (!file) {
            res.status(409).json({
                error: 'POSTER IS NOT ATTACHED',
                code: 1
            });
        }

        let basename = path.basename(file.filename, path.extname(file.filename));
        resizeForThumbnail(file.path, 'P')
            .then(() => {
                req.body.poster_path = `/exhibition/${req.body.exhibition_no}/${file.filename}`;
                req.body.poster_thumbnail_path = `/exhibition/${req.body.exhibition_no}/${basename}_thumb.jpeg`;
                return createContent(decodedToken._id, req.params.board_id, req.body, 'EH')
            })
            .then((content_id) => {
                return createExhibition(content_id, req.body)
            })
            .then(() => {
                res.json({ success: true })
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({
                    success: false,
                    error: 'CREATE EXHIBITION FAIL',
                    code: 1
                })
            });
    });

export default router;