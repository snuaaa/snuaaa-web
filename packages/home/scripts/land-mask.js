// Builds src/assets/data/land.png, a grayscale equirectangular land mask (white = land) for the Earth
// in the background, from Natural Earth's 1:110m land polygons (public domain).
// Input: ne_110m_land.geojson from https://github.com/nvkelso/natural-earth-vector
//   node scripts/land-mask.js path/to/ne_110m_land.geojson
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const input = process.argv[2];
if (!input) {
  console.error('usage: node scripts/land-mask.js <ne_110m_land.geojson>');
  process.exit(1);
}

const WIDTH = 1024;
const HEIGHT = 512;
const SS = 4; // supersampling per axis, for soft coastlines

const rings = JSON.parse(readFileSync(input, 'utf8')).features.flatMap((f) =>
  f.geometry.type === 'Polygon'
    ? f.geometry.coordinates
    : f.geometry.coordinates.flat(),
);

// Even-odd scanline fill at SS x SS resolution, accumulated into coverage per output pixel.
const W = WIDTH * SS;
const H = HEIGHT * SS;
const coverage = new Float32Array(WIDTH * HEIGHT);
for (let y = 0; y < H; y += 1) {
  const lat = 90 - ((y + 0.5) / H) * 180;
  const xs = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i += 1) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];
      if (lat1 > lat === lat2 > lat) continue;
      const lon = lon1 + ((lat - lat1) / (lat2 - lat1)) * (lon2 - lon1);
      xs.push(((lon + 180) / 360) * W);
    }
  }
  xs.sort((a, b) => a - b);
  for (let k = 0; k + 1 < xs.length; k += 2) {
    const from = Math.max(0, Math.ceil(xs[k] - 0.5));
    const to = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5));
    for (let x = from; x <= to; x += 1) {
      coverage[Math.floor(y / SS) * WIDTH + Math.floor(x / SS)] += 1;
    }
  }
}

// Grayscale PNG: one filter byte (0) per row, then the pixels.
const raw = Buffer.alloc((WIDTH + 1) * HEIGHT);
for (let y = 0; y < HEIGHT; y += 1) {
  for (let x = 0; x < WIDTH; x += 1) {
    raw[y * (WIDTH + 1) + 1 + x] = Math.round(
      (coverage[y * WIDTH + x] / (SS * SS)) * 255,
    );
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 0; // grayscale
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = fileURLToPath(
  new URL('../src/assets/data/land.png', import.meta.url),
);
writeFileSync(out, png);
console.log(
  `wrote ${WIDTH}x${HEIGHT} land mask (${png.length} bytes) to ${out}`,
);
