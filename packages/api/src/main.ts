// [LOAD PACKAGES]
import './instrument';
import express from 'express';
import api from './routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { errorHandler } from './middlewares/errorHandler';
import logger from './middlewares/logger';
import helmet from 'helmet';

const app = express();

// [CONFIGURE APP TO USE bodyParser]
// The web client is served from a different origin and loads `/static` images,
// so allow cross-origin embedding (helmet defaults to same-origin since v5).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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

// [CONFIGURE SERVER PORT]
const port = process.env.PORT || 8080;

// [RUN SERVER]
app.listen(port, () => console.log(`Server listening on port ${port}`));

// [CONFIGURE ROUTER]
app.use('/api', api);
app.use(errorHandler);
