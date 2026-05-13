import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrieveDocumentCount, retrieveDocument, retrieveDocuments, deleteDocument } from "../controllers/document.controller";
import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { checkLike } from "../controllers/contentLike.controller";

const router = express.Router();

router.get('/', verifyTokenMiddleware, (req, res) => {
    

    let offset = 0;
    let docCount = 0;
    const ROWNUM = 10;
    const { query } = req as any;


    if (query.page > 0) {
        offset = ROWNUM * (query.page - 1);
    }

    retrieveDocumentCount(req.query.category, req.query.generation)
        .then((count: any) => {
            docCount = count;
            return retrieveDocuments(ROWNUM, offset, req.query.category, req.query.generation)
        })
        .then((docInfo) => {
            res.json({
                docCount: docCount,
                docInfo: docInfo
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        })
})

router.get('/:doc_id', verifyTokenMiddleware, (req, res, next) => {

    const { decodedToken } = req as any;

    try {
        let resDocInfo = {};
        retrieveDocument(req.params.doc_id)
        .then((docInfo: any) => {
            resDocInfo = docInfo;

            if(docInfo.board.lv_read < decodedToken.grade) {
                const err = {
                    status: 403,
                    code: 4001
                }
                next(err);
            }
            else {
                return Promise.all([
                    checkLike(req.params.doc_id, decodedToken._id),
                    increaseViewNum(req.params.doc_id)
                ])
            }
        })
        .then((infos) => {
            res.json({
                docuInfo: resDocInfo,
                likeInfo: infos[0]
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
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'INTERNAL SERVER ERROR'
        });
    }


})

router.patch('/:doc_id', verifyTokenMiddleware, (req, res) => {
    

    updateContent(req.params.doc_id, req.body)
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



router.delete('/:doc_id', verifyTokenMiddleware, (req, res) => {
    

    deleteDocument(req.params.doc_id)
        .then(() => {
            return deleteContent(req.params.doc_id)
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
})

export default router;

// @deprecated
// router.get('/generation/:genNum', verifyTokenMiddleware, (req, res) => {
//     

//     retrieveDocuments(req.params.genNum)
//         .then((docuInfo) => {
//             res.json(docuInfo)
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(409).json({
//                 error: 'RETRIEVE DOCUMENT FAIL',
//                 code: 1
//             });
//         })
// })

// @deprecated
// router.get('/:docuId/download/:index', (req, res) => {
//     

//     retrieveDocument(req.params.docuId)
//     .then((docuInfo) => {
//         let index = req.params.index;
//         console.log('./upload' + docuInfo.file_path[index])
//         res.download('./upload' + docuInfo.file_path[index])
//     })
//     .catch((err) => {
//         console.error(err)
//         res.status(409).json({
//             error: 'DOWNLOAD DOCUMENT FAIL',
//             code: 1
//         });
//     })

// })
