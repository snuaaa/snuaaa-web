import express from 'express';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { retrievePost, retrievePostsWithFilter, SearchType } from '../controllers/post.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';

const router = express.Router();

router.get('/list', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
  const decodedToken = req.decodedToken;
  const userUuid = req.query.user_uuid as string;

  const filter: Record<string, unknown> = {
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

router.get('/:post_id', verifyTokenMiddleware, async (req: AuthenticatedRequest, res, next) => {
  const decodedToken = req.decodedToken;

  try {
    const postInfo = await retrievePost(req.params.post_id);

    if (
      (postInfo as Record<string, unknown> & { board: { lv_read: number } }).board.lv_read <
      decodedToken.grade
    ) {
      return next({ status: 403, code: 4001 });
    }

    const [likeInfo] = await Promise.all([
      checkLike(req.params.post_id, decodedToken._id),
      increaseViewNum(req.params.post_id),
    ]);

    res.json({ postInfo, likeInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json();
  }
});

router.patch('/:post_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await updateContent(req.params.post_id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json();
  }
});

router.delete('/:post_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await deleteContent(req.params.post_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json();
  }
});

export default router;
