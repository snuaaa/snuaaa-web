import express from 'express';
import request from 'request';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const xmlParser = require('fast-xml-parser');

import 'dotenv/config';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';
import {
  retrieveSoundBox,
  retrieveRecentPosts,
  retrieveAllPosts,
} from '../controllers/post.controller';
import { retrievePhotosInBoard } from '../controllers/photo.controller';
import { retrieveRecentComments, retrieveAllComments } from '../controllers/comment.controller';
import { retrieveAlbumsInBoard } from '../controllers/album.controller';

const router = express.Router();

router.get('/soundbox', verifyTokenMiddleware, (req, res) => {
  retrieveSoundBox()
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Soundbox fail',
      });
    });
});

router.get('/posts', verifyTokenMiddleware, (req: AuthenticatedRequest, res) => {
  const { decodedToken } = req;

  retrieveRecentPosts(decodedToken.grade)
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Posts fail',
      });
    });
});

router.get('/posts/all', verifyTokenMiddleware, (req: AuthenticatedRequest, res) => {
  const ROWNUM = 10;
  let offset = 0;
  const { query, decodedToken } = req;

  if (Number(query.page) > 0) {
    offset = ROWNUM * (Number(query.page) - 1);
  }
  retrieveAllPosts(decodedToken.grade, ROWNUM, offset)
    .then((postInfo: { count: number; rows: unknown[] }) => {
      res.json({
        postCount: postInfo.count,
        postInfo: postInfo.rows,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Posts fail',
      });
    });
});

router.get('/memory', verifyTokenMiddleware, (req, res) => {
  retrieveAlbumsInBoard('brd31', 4, 0, null)
    .then((albums) => {
      res.json(albums);
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Photos fail',
      });
    });
});

router.get('/astrophoto', verifyTokenMiddleware, (req, res) => {
  retrievePhotosInBoard('brd32', 9, 0)
    .then((photos) => {
      res.json(photos);
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Photos fail',
      });
    });
});

router.get('/comments', verifyTokenMiddleware, (req, res) => {
  retrieveRecentComments()
    .then((commentInfo) => {
      res.json(commentInfo);
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Comments fail',
      });
    });
});

router.get('/comments/all', verifyTokenMiddleware, (req: AuthenticatedRequest, res) => {
  const ROWNUM = 10;
  let offset = 0;
  const { query, decodedToken } = req;

  if (Number(query.page) > 0) {
    offset = ROWNUM * (Number(query.page) - 1);
  }
  retrieveAllComments(decodedToken.grade, ROWNUM, offset)
    .then((commentInfo: { count: number; rows: unknown[] }) => {
      res.json({
        commentCount: commentInfo.count,
        commentInfo: commentInfo.rows,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({
        error: 'Retrieve Comments fail',
      });
    });
});

interface RiseSetItem {
  sunrise?: number;
  sunset?: number;
  moonrise?: number;
  moonset?: number;
  astm?: number;
  aste?: number;
}

interface MoonPhaseItem {
  lunAge?: number;
}

interface ApiResponse {
  response?: {
    body?: {
      items?: {
        item?: RiseSetItem | MoonPhaseItem;
      };
    };
  };
}

router.get('/riseset', verifyTokenMiddleware, (req, res) => {
  const today = new Date();
  const year = today.getFullYear().toString();
  let month: string | number = today.getMonth() + 1;
  let day: string | number = today.getDate();
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;

  const dayformat = `${year}${month}${day}`;

  try {
    if (!fs.existsSync(path.join('.', 'riseset'))) {
      fs.mkdirSync(path.join('.', 'riseset'));
    }
  } catch (err) {
    console.error(err);
  }

  try {
    const riseSetJsonPath = path.join('.', 'riseset', `${dayformat}.json`);

    if (fs.existsSync(riseSetJsonPath)) {
      const riseSetInfo = fs.readFileSync(riseSetJsonPath, 'utf8');
      res.json(JSON.parse(riseSetInfo));
    } else {
      const riseSetUrl =
        'http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo';
      let riseSetQueryParams =
        '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RISESET_SERVICE_KEY;
      riseSetQueryParams +=
        '&' + encodeURIComponent('locdate') + '=' + encodeURIComponent(dayformat);
      riseSetQueryParams += '&' + encodeURIComponent('location') + '=' + encodeURIComponent('서울');

      request.get(riseSetUrl + riseSetQueryParams, (err, response, body) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            code: 0,
          });
        } else if (!xmlParser.validate(body)) {
          console.error('xml parse error');
          return res.status(500).json({
            success: false,
            code: 0,
          });
        } else {
          const riseSetData: ApiResponse = xmlParser.parse(body);
          let riseSetItem: RiseSetItem = {};
          if (
            riseSetData.response &&
            riseSetData.response.body &&
            riseSetData.response.body.items &&
            riseSetData.response.body.items.item
          ) {
            riseSetItem = riseSetData.response.body.items.item as RiseSetItem;
          } else {
            console.error('api error');
            return res.status(500).json({
              success: false,
              code: 0,
            });
          }

          const moonPhaseUrl =
            'http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService/getLunPhInfo';
          let moonPhaseQueryParams =
            '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RISESET_SERVICE_KEY;
          moonPhaseQueryParams +=
            '&' + encodeURIComponent('solYear') + '=' + encodeURIComponent(year);
          moonPhaseQueryParams +=
            '&' + encodeURIComponent('solMonth') + '=' + encodeURIComponent(String(month));
          moonPhaseQueryParams +=
            '&' + encodeURIComponent('solDay') + '=' + encodeURIComponent(String(day));

          request.get(moonPhaseUrl + moonPhaseQueryParams, (err, response, body) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                success: false,
                code: 0,
              });
            } else if (!xmlParser.validate(body)) {
              console.error('xml parse error');
              return res.status(500).json({
                success: false,
                code: 0,
              });
            } else {
              const moonPhaseData: ApiResponse = xmlParser.parse(body);
              let moonPhaseItem: MoonPhaseItem = {};
              if (
                moonPhaseData.response &&
                moonPhaseData.response.body &&
                moonPhaseData.response.body.items &&
                moonPhaseData.response.body.items.item
              ) {
                moonPhaseItem = moonPhaseData.response.body.items.item as MoonPhaseItem;
              } else {
                console.error('api error');
                return res.status(500).json({
                  success: false,
                  code: 0,
                });
              }

              const AstroInfo = {
                sunrise: riseSetItem.sunrise,
                sunset: riseSetItem.sunset,
                moonrise: riseSetItem.moonrise,
                moonset: riseSetItem.moonset,
                astm: riseSetItem.astm,
                aste: riseSetItem.aste,
                lunAge: moonPhaseItem.lunAge,
              };
              fs.writeFileSync(riseSetJsonPath, JSON.stringify(AstroInfo), 'utf8');
              res.json(AstroInfo);
            }
          });
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
});

export default router;
