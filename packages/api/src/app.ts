import express from 'express';
import api from './routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { errorHandler } from './middlewares/errorHandler';
import logger from './middlewares/logger';
import helmet from 'helmet';
import 'dotenv/config';

const app = express();

app.use(helmet());
app.use(logger);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const devServerOrigins = [
  'https://dev.snuaaa.net',
  'https://develop.snuaaa-web.pages.dev',
  'http://localhost:3000',
];
const prodServerOrigins = ['https://www.snuaaa.net', 'https://our.snuaaa.net'];

const origin =
  process.env.NODE_ENV == 'develop' ? devServerOrigins : prodServerOrigins;

app.use(cors({ origin, optionsSuccessStatus: 200 }));

app.use('/static', express.static(__dirname + '/../upload'));

app.use('/api', api);
app.use(errorHandler);

export default app;
