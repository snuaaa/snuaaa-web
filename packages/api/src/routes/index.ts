import express from 'express';

import auth from './auth';
// import { verifyTokenMiddleware } from '../middlewares/auth';

const router = express.Router();

router.use('/auth', auth);

export default router;
