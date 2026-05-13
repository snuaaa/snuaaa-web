import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { updateComment, deleteComment, retrieveCommentsWithFilter } from '../controllers/comment.controller';
import { checkCommentLike, dislikeComment, likeComment } from '../controllers/commentLike.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';

const router = express.Router();

router.get('/list', verifyTokenMiddleware, async (req, res) => {
    const decodedToken = (req as any).decodedToken;
    const userUuid = req.query.user_uuid as string;

    const filter = {
        read_grade: decodedToken.grade,
        limit: Number(req.query.limit) || undefined,
        offset: Number(req.query.offset) || undefined,
    }

    try {
        if (userUuid) {
            const user = await retrieveUserByUserUuid(userUuid);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            const author_id = user.getDataValue('user_id');
            filter['author_id'] = author_id;
        }

        const commentList = await retrieveCommentsWithFilter(filter)
        return res.json(commentList);
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: 'INTERNAL SERVER ERROR'
        });
    }
});


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
