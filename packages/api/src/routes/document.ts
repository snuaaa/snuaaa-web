import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrieveDocumentCount,
  retrieveDocument,
  retrieveDocuments,
  deleteDocument,
} from '../controllers/document.controller';
import {
  updateContent,
  deleteContent,
  increaseViewNum,
} from '../controllers/content.controller';
import { checkLike } from '../controllers/contentLike.controller';

const router = express.Router();

router.get(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    let offset = 0;
    const ROWNUM = 10;
    const { query } = req;

    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }

    try {
      const docCount = await retrieveDocumentCount(
        req.query.category,
        req.query.generation,
      );
      const docInfo = await retrieveDocuments(
        ROWNUM,
        offset,
        req.query.category,
        req.query.generation,
      );
      res.json({
        docCount,
        docInfo,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

router.get(
  '/:doc_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;

    try {
      const docInfo = await retrieveDocument(req.params.doc_id);

      if (docInfo.board.lv_read < decodedToken.grade) {
        const err = {
          status: 403,
          code: 4001,
        };
        return next(err);
      }

      const [likeInfo] = await Promise.all([
        checkLike(req.params.doc_id, decodedToken._id),
        increaseViewNum(req.params.doc_id),
      ]);

      res.json({
        docuInfo: docInfo,
        likeInfo,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

router.patch('/:doc_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await updateContent(req.params.doc_id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.delete('/:doc_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await deleteDocument(req.params.doc_id);
    await deleteContent(req.params.doc_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

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
