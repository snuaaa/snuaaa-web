import supertest from 'supertest';
import app from '../../src/app';

/** A supertest agent for the API app. No server is started. */
export const api = () => supertest(app);
