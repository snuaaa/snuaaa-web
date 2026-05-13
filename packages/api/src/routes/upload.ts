import express from 'express';
import multer from 'multer';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { resizeImageBuffer } from '../lib/resize';
import { uploadImageToS3 } from '../lib/upload';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage })

router.post('/image', verifyTokenMiddleware, upload.single('image'), async (req, res) => {
    
    const { file } = req as any;

    try {
        if (!file) {
            return res.status(409).json({
                error: 'Image is not attached',
            });
        }
        const withThumbnail = req.query.thumbnail === 'true';

        const [imgUrl, thumbnailUrl] = await Promise.all([
            resizeImageBuffer(file.buffer).then(uploadImageToS3),
            ...(withThumbnail ? [
                resizeImageBuffer(file.buffer, { shortSideSize: 360 }).then(uploadImageToS3),
            ] : [])
        ]);

      res.json({
          imgUrl,
          thumbnailUrl,
          result: 'success'
      });        
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: 'internal server error',
            code: 0
        });
    }
})

export default router;
