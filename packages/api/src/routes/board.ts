import express from 'express';
import path from 'path';
import uploadMiddleware, {
  AuthenticatedRequestWithFile,
} from '../middlewares/upload';
import { verifyTokenMiddleware } from '../middlewares/auth';
import {
  retrieveBoard,
  retrieveBoardsCanAccess,
} from '../controllers/board.controller';
import { createContent } from '../controllers/content.controller';
import {
  retrievePostsInBoard,
  createPost,
} from '../controllers/post.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { createDocument } from '../controllers/document.controller';
import {
  retrieveExhibitions,
  createExhibition,
} from '../controllers/exhibition.controller';
import { resizeForThumbnail } from '../utils/resize';
import uuid4 from 'uuid4';
import type { AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();

router.get(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const decodedToken = req.decodedToken;
      const boardInfo = await retrieveBoardsCanAccess(decodedToken.grade);
      return res.json(boardInfo);
    } catch (err) {
      console.error(err);
      return res.status(403).json({
        success: false,
      });
    }
  },
);

router.get(
  '/:board_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;

    try {
      const boardInfo = await retrieveBoard(req.params.board_id);
      if ((boardInfo.get('lv_read') as number) < decodedToken.grade) {
        const err = {
          status: 403,
          code: 4001,
        };
        next(err);
        return;
      }
      res.json({
        boardInfo: boardInfo,
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

router.get('/:board_id/posts', verifyTokenMiddleware, async (req, res) => {
  let offset = 0;
  const ROWNUM = 10;
  const query = req.query;
  if ('page' in query && typeof query.page === 'number' && query.page > 0) {
    offset = ROWNUM * (query.page - 1);
  }

  try {
    const postInfo = await retrievePostsInBoard(
      req.params.board_id,
      ROWNUM,
      offset,
    );
    res.json({
      postCount: postInfo.count,
      postInfo: postInfo.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(403).json({
      success: false,
      error: 'RETRIEVE POST FAIL',
      code: 1,
    });
  }
});

router.get('/:board_id/tags', verifyTokenMiddleware, async (req, res) => {
  try {
    const tags = await retrieveTagsOnBoard(req.params.board_id);
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(403).json({
      success: false,
      error: 'RETRIEVE POST FAIL',
      code: 1,
    });
  }
});

router.post(
  '/:board_id/post',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const decodedToken = req.decodedToken;

    const postData = {
      ...req.body,
      author_id: decodedToken._id,
      board_id: req.params.board_id,
    };

    try {
      const content_id = await createPost(postData);
      res.json({
        content_id: content_id,
        success: true,
      });
    } catch (err) {
      console.error(err);
      res.status(403).json({
        success: false,
        error: 'RETRIEVE POST FAIL',
        code: 1,
      });
    }
  },
);

router.post(
  '/:board_id/document',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const decodedToken = req.decodedToken;

    try {
      const user_id = decodedToken._id;

      const data = {
        content_uuid: uuid4(),
        author_id: user_id,
        board_id: req.params.board_id,
        category_id: req.body.category_id,
        title: req.body.title,
        text: req.body.text,
        type: 'DO',
        generation: req.body.generation ? req.body.generation : null,
      };

      const content_id = await createDocument(data);
      return res.json({
        content_id: content_id,
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL SERVER ERROR',
        code: 0,
      });
    }
  },
);

router.get(
  '/:board_id/exhibitions',
  verifyTokenMiddleware,
  async (req, res) => {
    try {
      const exhibitionInfo = await retrieveExhibitions();
      res.json(exhibitionInfo);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'RETRIEVE EXHIBITIONS FAIL',
        code: 1,
      });
    }
  },
);

router.post(
  '/:board_id/exhibition',
  verifyTokenMiddleware,
  uploadMiddleware('EH').single('poster'),
  async (req: AuthenticatedRequestWithFile, res) => {
    const decodedToken = req.decodedToken;
    const file = req.file;

    if (!file) {
      return res.status(409).json({
        error: 'POSTER IS NOT ATTACHED',
        code: 1,
      });
    }

    try {
      const basename = path.basename(
        file.filename,
        path.extname(file.filename),
      );
      await resizeForThumbnail(file.path, 'P');

      req.body.poster_path = `/exhibition/${req.body.exhibition_no}/${file.filename}`;
      req.body.poster_thumbnail_path = `/exhibition/${req.body.exhibition_no}/${basename}_thumb.jpeg`;

      const content_id = await createContent(
        decodedToken._id,
        req.params.board_id,
        req.body,
        'EH',
      );
      await createExhibition(content_id, req.body);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'CREATE EXHIBITION FAIL',
        code: 1,
      });
    }
  },
);

export default router;
