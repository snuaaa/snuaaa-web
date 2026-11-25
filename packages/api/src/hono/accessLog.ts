import fs from 'fs';
import path from 'path';
import { createMiddleware } from 'hono/factory';
import { getConnInfo } from '@hono/node-server/conninfo';
import type { HttpBindings } from '@hono/node-server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const rfs = require('rotating-file-stream');

const pad = (number: number) => String(number).padStart(2, '0');

/** `log/<yyyymm>/<yyyymmdd>-<hhmm>-<index>-file.log`, as before. */
function fileName(time: Date | null, index: number) {
  if (!time) return 'snuaaa.log';
  const month = `${time.getFullYear()}${pad(time.getMonth() + 1)}`;
  const day = pad(time.getDate());
  const minute = `${pad(time.getHours())}${pad(time.getMinutes())}`;
  return `${month}/${month}${day}-${minute}-${index}-file.log`;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** The Common Log Format date, in UTC like morgan: `25/Nov/2026:22:05:09 +0000`. */
function clfDate(date: Date) {
  return (
    `${pad(date.getUTCDate())}/${MONTHS[date.getUTCMonth()]}/` +
    `${date.getUTCFullYear()}:${pad(date.getUTCHours())}:` +
    `${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} +0000`
  );
}

const orDash = (value: string | null | undefined) => value || '-';

let stream: { write(line: string): void } | undefined;

function logStream() {
  if (!stream) {
    const directory = path.join('.', 'log');
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    stream = rfs(fileName, { size: '10M', interval: '1d', path: directory });
  }
  return stream!;
}

/**
 * Writes one line per request to the rotating files in `log/`, in the
 * Apache combined format morgan wrote before.
 */
export const accessLog = createMiddleware<{ Bindings: HttpBindings }>(
  async (context, next) => {
    const started = new Date();
    await next();
    const { req, res } = context;
    const address = getConnInfo(context).remote.address;
    const httpVersion = context.env?.incoming?.httpVersion ?? '1.1';
    logStream().write(
      `${orDash(address)} - - [${clfDate(started)}] ` +
        `"${req.method} ${new URL(req.url).pathname}${new URL(req.url).search} HTTP/${httpVersion}" ` +
        `${res.status} ${orDash(res.headers.get('content-length'))} ` +
        `"${orDash(req.header('referer'))}" "${orDash(req.header('user-agent'))}"\n`,
    );
  },
);
