import express from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth';
import { deleteAttachedFile } from '../controllers/attachedFile.controller';

const router = express.Router();

router.delete('/:file_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await deleteAttachedFile(req.params.file_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'UPDATE FAIL',
      code: 0,
    });
  }
});

export default router;
