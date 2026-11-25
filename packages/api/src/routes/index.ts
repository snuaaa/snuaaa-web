import express from 'express';

/**
 * Every endpoint has moved to Hono (`hono/app.ts`, #158), so no Express
 * router is left; the Express app itself goes in a follow-up.
 */
const router = express.Router();

export default router;
