// Builds src/assets/data/stars.bin from the Yale Bright Star Catalog (BSC5, ~9,100 stars down to magnitude 6.5).
// Input: bsc5-short.json from https://github.com/brettonw/YaleBrightStarCatalog
//   node scripts/star-catalog.js path/to/bsc5-short.json
//
// Each star is 6 bytes, little-endian:
//   uint16 RA in hundredths of a degree (0-35999)
//   int16  Dec in hundredths of a degree (-9000-9000)
//   int8   visual magnitude x10
//   uint8  color temperature / 100 K
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const input = process.argv[2];
if (!input) {
  console.error('usage: node scripts/star-catalog.js <bsc5-short.json>');
  process.exit(1);
}

const parseRA = (s) => {
  const [, h, m, sec] = s.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
  return (Number(h) + Number(m) / 60 + Number(sec) / 3600) * 15;
};
const parseDec = (s) => {
  const [, sign, d, m, sec] = s.match(/([+-])(\d+)°\s*(\d+)′\s*([\d.]+)″/);
  const v = Number(d) + Number(m) / 60 + Number(sec) / 3600;
  return sign === '-' ? -v : v;
};

const stars = JSON.parse(readFileSync(input, 'utf8'))
  .filter((s) => s.RA && s.Dec && s.V)
  .map((s) => ({
    ra: parseRA(s.RA),
    dec: parseDec(s.Dec),
    mag: Number(s.V),
    k: Number(s.K) || 6000,
  }))
  // Brightest first, so the file is stable across rebuilds and easy to trim by magnitude.
  .sort((a, b) => a.mag - b.mag);

const buf = Buffer.alloc(stars.length * 6);
stars.forEach((s, i) => {
  const o = i * 6;
  buf.writeUInt16LE(Math.round(s.ra * 100) % 36000, o);
  buf.writeInt16LE(Math.round(s.dec * 100), o + 2);
  buf.writeInt8(Math.max(-128, Math.min(127, Math.round(s.mag * 10))), o + 4);
  buf.writeUInt8(Math.max(0, Math.min(255, Math.round(s.k / 100))), o + 5);
});

const out = fileURLToPath(
  new URL('../src/assets/data/stars.bin', import.meta.url),
);
writeFileSync(out, buf);
console.log(`wrote ${stars.length} stars (${buf.length} bytes) to ${out}`);
