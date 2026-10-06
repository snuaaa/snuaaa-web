import express from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth';
import {
  deleteAttachedFile,
  migrateAttachedFiles,
} from '../controllers/attachedFile.controller';

const router = express.Router();

router.delete('/:file_id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await deleteAttachedFile(req.params.file_id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/migrate', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await migrateAttachedFiles();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
