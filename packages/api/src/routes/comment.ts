import express from 'express';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

import {
  updateComment,
  deleteComment,
  retrieveCommentsWithFilter,
  CommentFilter,
} from '../controllers/comment.controller';
import {
  checkCommentLike,
  dislikeComment,
  likeComment,
} from '../controllers/commentLike.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';

const router = express.Router();

router.get('/list', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
  const decodedToken = req.decodedToken;
  const userUuid = req.query.user_uuid as string;

  const filter: CommentFilter = {
    read_grade: decodedToken.grade,
    limit: Number(req.query.limit) || undefined,
    offset: Number(req.query.offset) || undefined,
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

    const commentList = await retrieveCommentsWithFilter(filter);
    return res.json(commentList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'INTERNAL SERVER ERROR',
    });
  }
});

router.patch('/:comment_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await updateComment(req.params.comment_id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.delete('/:comment_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await deleteComment(req.params.comment_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.post('/:comment_id/like', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
  const { decodedToken } = req;
  const comment_id = req.params.comment_id;
  const user_id = decodedToken._id;

  try {
    const isLiked = await checkCommentLike(comment_id, user_id);
    if (isLiked) {
      await dislikeComment(comment_id, user_id);
    } else {
      await likeComment(comment_id, user_id);
    }
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
