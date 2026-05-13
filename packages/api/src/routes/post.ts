import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { retrievePost, retrievePostsWithFilter, SearchType } from '../controllers/post.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';

const router = express.Router();

router.get('/list', verifyTokenMiddleware, async (req, res) => {
  const decodedToken = (req as any).decodedToken;
  const userUuid = req.query.user_uuid as string;

  const filter = {
    board_id: req.query.board_id as string,
    read_grade: decodedToken.grade,
    limit: Number(req.query.limit) || undefined,
    offset: Number(req.query.offset) || undefined,
    search_keyword: (req.query.search_keyword as string) || undefined,
    search_type: (req.query.search_type as SearchType) || undefined,
  };

  try {
    if (userUuid) {
      const user = await retrieveUserByUserUuid(userUuid);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      const author_id = user.getDataValue('user_id');
      filter['author_id'] = author_id;
    }

    const postList = await retrievePostsWithFilter(filter);
    return res.json(postList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'INTERNAL SERVER ERROR',
    });
  }
});

router.get('/:post_id', verifyTokenMiddleware, (req, res, next) => {
  const decodedToken = (req as any).decodedToken;

  try {
    let resPostInfo = {};

    retrievePost(req.params.post_id)
      .then((postInfo) => {
        resPostInfo = postInfo;

        if ((postInfo as any).board.lv_read < decodedToken.grade) {
          const err = {
            status: 403,
            code: 4001,
          };
          next(err);
          return;
        } else {
          return Promise.all([
            checkLike(req.params.post_id, decodedToken._id),
            increaseViewNum(req.params.post_id),
          ]);
        }
      })
      .then((infos) => {
        if (infos) {
          res.json({ postInfo: resPostInfo, likeInfo: infos[0] });
        } else {
          res.status(404).json();
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json();
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'INTERNAL SERVER ERROR',
    });
  }
});

router.patch('/:post_id', verifyTokenMiddleware, (req, res) => {
  updateContent(req.params.post_id, req.body)
    .then(() => {
      return res.json({ success: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json();
    });
});

router.delete('/:post_id', verifyTokenMiddleware, (req, res) => {
  deleteContent(req.params.post_id)
    .then(() => {
      return res.json({ success: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json();
    });
});

export default router;
