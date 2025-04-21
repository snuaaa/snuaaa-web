import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { retrievePost } from '../controllers/post.controller';
import { checkLike } from '../controllers/contentLike.controller';


const router = express.Router();

router.get('/:post_id', verifyTokenMiddleware, (req, res, next) => {
    
    const decodedToken = (req as any).decodedToken;

    try {
        let resPostInfo = {}
    
        retrievePost(req.params.post_id)
            .then((postInfo) => {
                resPostInfo = postInfo;
    
                if ((postInfo as any).board.lv_read < decodedToken.grade) {
                    const err = {
                        status: 403,
                        code: 4001
                    }
                    next(err);
                    return;
                }
                else {
                    return Promise.all([
                        checkLike(req.params.post_id, decodedToken._id),
                        increaseViewNum(req.params.post_id)
                    ])
                }
            })
            .then((infos) => {
                if (infos) {
                    res.json({ postInfo: resPostInfo, likeInfo: infos[0] })                    
                } else {
                    res.status(404).json();   
                }
            })
            .catch((err) => {
                console.error(err)
                res.status(500).json()
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

router.patch('/:post_id', verifyTokenMiddleware, (req, res) => {
    

    updateContent(req.params.post_id, req.body)
        .then(() => {
            return res.json({ success: true });
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json()
        })
})

router.delete('/:post_id', verifyTokenMiddleware, (req, res) => {
    
    
    deleteContent(req.params.post_id)
        .then(() => {
            return res.json({ success: true });
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json()
        })
})

export default router;
