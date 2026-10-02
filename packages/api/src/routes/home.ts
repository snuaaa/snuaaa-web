import express from 'express';
import fs from 'fs';
import path from 'path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

import 'dotenv/config';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';
import {
  retrieveSoundBox,
  retrieveRecentPosts,
  retrieveAllPosts,
} from '../controllers/post.controller';
import { retrievePhotosInBoard } from '../controllers/photo.controller';
import {
  retrieveRecentComments,
  retrieveAllComments,
} from '../controllers/comment.controller';
import { retrieveAlbumsInBoard } from '../controllers/album.controller';

const router = express.Router();
const xmlParser = new XMLParser();

router.get('/soundbox', verifyTokenMiddleware, async (req, res) => {
  try {
    const post = await retrieveSoundBox();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Soundbox fail' });
  }
});

router.get(
  '/posts',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const posts = await retrieveRecentPosts(req.decodedToken.grade);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Retrieve Posts fail' });
    }
  },
);

router.get(
  '/posts/all',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const ROWNUM = 10;
    let offset = 0;
    const { query, decodedToken } = req;

    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }

    try {
      const postInfo = (await retrieveAllPosts(
        decodedToken.grade,
        ROWNUM,
        offset,
      )) as {
        count: number;
        rows: unknown[];
      };
      res.json({
        postCount: postInfo.count,
        postInfo: postInfo.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Retrieve Posts fail' });
    }
  },
);

router.get('/memory', verifyTokenMiddleware, async (req, res) => {
  try {
    const albums = await retrieveAlbumsInBoard('brd31', 4, 0, null);
    res.json(albums);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Photos fail' });
  }
});

router.get('/astrophoto', verifyTokenMiddleware, async (req, res) => {
  try {
    const photos = await retrievePhotosInBoard('brd32', 9, 0);
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Photos fail' });
  }
});

router.get('/comments', verifyTokenMiddleware, async (req, res) => {
  try {
    const commentInfo = await retrieveRecentComments();
    res.json(commentInfo);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Retrieve Comments fail' });
  }
});

router.get(
  '/comments/all',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const ROWNUM = 10;
    let offset = 0;
    const { query, decodedToken } = req;

    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }

    try {
      const commentInfo = (await retrieveAllComments(
        decodedToken.grade,
        ROWNUM,
        offset,
      )) as {
        count: number;
        rows: unknown[];
      };
      res.json({
        commentCount: commentInfo.count,
        commentInfo: commentInfo.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Retrieve Comments fail' });
    }
  },
);

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

const fetchApiItem = async <T>(url: string): Promise<T | null> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`api request failed: ${response.status}`);
  }
  const body = await response.text();
  if (XMLValidator.validate(body) !== true) {
    throw new Error('xml parse error');
  }
  const data: ApiResponse = xmlParser.parse(body);
  return (data.response?.body?.items?.item as T) ?? null;
};

router.get('/riseset', verifyTokenMiddleware, async (req, res) => {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

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
      return;
    }

    const serviceKey = process.env.RISESET_SERVICE_KEY;

    const riseSetUrl =
      'http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo' +
      `?ServiceKey=${serviceKey}` +
      `&locdate=${encodeURIComponent(dayformat)}` +
      `&location=${encodeURIComponent('서울')}`;
    const riseSetItem = await fetchApiItem<RiseSetItem>(riseSetUrl);
    if (!riseSetItem) {
      console.error('api error');
      res.status(500).json({ success: false, code: 0 });
      return;
    }

    const moonPhaseUrl =
      'http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService/getLunPhInfo' +
      `?ServiceKey=${serviceKey}` +
      `&solYear=${encodeURIComponent(year)}` +
      `&solMonth=${encodeURIComponent(month)}` +
      `&solDay=${encodeURIComponent(day)}`;
    const moonPhaseItem = await fetchApiItem<MoonPhaseItem>(moonPhaseUrl);
    if (!moonPhaseItem) {
      console.error('api error');
      res.status(500).json({ success: false, code: 0 });
      return;
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, code: 0 });
  }
});

export default router;
