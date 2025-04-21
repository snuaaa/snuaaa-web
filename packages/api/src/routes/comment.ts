import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { updateComment, deleteComment } from '../controllers/comment.controller';
import { checkCommentLike, dislikeComment, likeComment } from '../controllers/commentLike.controller';

const router = express.Router();

router.patch('/:comment_id', verifyTokenMiddleware, (req, res) => {

    updateComment(req.params.comment_id, req.body)
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });

});

router.delete('/:comment_id', verifyTokenMiddleware, (req, res) => {
    
    deleteComment(req.params.comment_id)
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
});

router.post('/:comment_id/like', verifyTokenMiddleware, (req, res) => {
    
    const { decodedToken } = req as any;
    const comment_id = req.params.comment_id;
    const user_id = decodedToken._id

    checkCommentLike(comment_id, user_id)
        .then((isLiked) => {
            return isLiked ? dislikeComment(comment_id, user_id) : likeComment(comment_id, user_id)
        })
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
});

export default router;
