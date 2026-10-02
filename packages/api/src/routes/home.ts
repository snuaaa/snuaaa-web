import express from 'express';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';
import {
  retrieveSoundBox,
  retrieveRecentPosts,
  retrieveAllPosts,
} from '../controllers/post.controller';
import { retrievePhotosInBoard } from '../controllers/photo.controller';
import {
  retrieveRecentComments,
  retrieveAllComments,
} from '../controllers/comment.controller';
import { retrieveAlbumsInBoard } from '../controllers/album.controller';
import { calcRiseSet } from '../utils/riseset';

const router = express.Router();

router.get('/soundbox', verifyTokenMiddleware, async (req, res) => {
  try {
    const post = await retrieveSoundBox();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Soundbox fail' });
  }
});

router.get(
  '/posts',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const posts = await retrieveRecentPosts(req.decodedToken.grade);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Retrieve Posts fail' });
    }
  },
);

router.get(
  '/posts/all',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const ROWNUM = 10;
    let offset = 0;
    const { query, decodedToken } = req;

    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }

    try {
      const postInfo = (await retrieveAllPosts(
        decodedToken.grade,
        ROWNUM,
        offset,
      )) as {
        count: number;
        rows: unknown[];
      };
      res.json({
        postCount: postInfo.count,
        postInfo: postInfo.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Retrieve Posts fail' });
    }
  },
);

router.get('/memory', verifyTokenMiddleware, async (req, res) => {
  try {
    const albums = await retrieveAlbumsInBoard('brd31', 4, 0, null);
    res.json(albums);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Photos fail' });
  }
});

router.get('/astrophoto', verifyTokenMiddleware, async (req, res) => {
  try {
    const photos = await retrievePhotosInBoard('brd32', 9, 0);
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Photos fail' });
  }
});

router.get('/comments', verifyTokenMiddleware, async (req, res) => {
  try {
    const commentInfo = await retrieveRecentComments();
    res.json(commentInfo);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Comments fail' });
  }
});

router.get(
  '/comments/all',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const ROWNUM = 10;
    let offset = 0;
    const { query, decodedToken } = req;

    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }

    try {
      const commentInfo = (await retrieveAllComments(
        decodedToken.grade,
        ROWNUM,
        offset,
      )) as {
        count: number;
        rows: unknown[];
      };
      res.json({
        commentCount: commentInfo.count,
        commentInfo: commentInfo.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Retrieve Comments fail' });
    }
  },
);

router.get('/riseset', verifyTokenMiddleware, (req, res) => {
  try {
    res.json(calcRiseSet());
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, code: 0 });
  }
});

export default router;
