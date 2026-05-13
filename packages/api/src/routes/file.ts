import express from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth';
import { deleteAttachedFile } from '../controllers/attachedFile.controller';

const router = express.Router();

router.delete('/:file_id', verifyTokenMiddleware, (req, res) => {
    

    try {
        deleteAttachedFile(req.params.file_id)
            .then(() => {
                res.json({
                    success: true
                })
            })
            .catch((err) => {
                console.error(err)
                return res.status(500).json({
                    error: 'UPDATE FAIL',
                    code: 0
                });    
            })
    }
    catch (err) {
        console.error(err)
    }
})

export default router;