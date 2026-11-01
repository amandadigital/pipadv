import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function renderPipIconRGBA(size, isMaskable = false) {
  const rowBytes = 1 + size * 4;
  const rawData = Buffer.alloc(size * rowBytes);

  // Colors in RGBA
  const paperBg = [250, 247, 238, 255];
  const borderBg = [213, 206, 189, 255];
  const lineCol = [225, 220, 210, 255];
  const redMargin = [220, 70, 70, 160];
  const darkInk = [43, 41, 38, 255];
  const scarfRed = [201, 52, 52, 255];
  const scarfDark = [139, 30, 30, 255];
  const yellowPencil = [217, 144, 17, 255];

  // Helper to set pixel
  function setPx(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const offset = y * rowBytes + 1 + x * 4;
    if (a < 255) {
      const bgR = rawData[offset];
      const bgG = rawData[offset + 1];
      const bgB = rawData[offset + 2];
      const alpha = a / 255;
      rawData[offset] = Math.round(r * alpha + bgR * (1 - alpha));
      rawData[offset + 1] = Math.round(g * alpha + bgG * (1 - alpha));
      rawData[offset + 2] = Math.round(b * alpha + bgB * (1 - alpha));
      rawData[offset + 3] = 255;
    } else {
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
      rawData[offset + 3] = a;
    }
  }

  // Draw background
  const cornerRadius = isMaskable ? 0 : size * 0.22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let isInside = true;
      if (!isMaskable) {
        let dx = 0;
        let dy = 0;
        if (x < cornerRadius) dx = cornerRadius - x;
        else if (x > size - cornerRadius) dx = x - (size - cornerRadius);
        if (y < cornerRadius) dy = cornerRadius - y;
        else if (y > size - cornerRadius) dy = y - (size - cornerRadius);
        if (dx > 0 && dy > 0) {
          isInside = (dx * dx + dy * dy <= cornerRadius * cornerRadius);
        }
      }

      if (isInside) {
        setPx(x, y, paperBg[0], paperBg[1], paperBg[2], 255);
      } else {
        const offset = y * rowBytes + 1 + x * 4;
        rawData[offset] = 0;
        rawData[offset + 1] = 0;
        rawData[offset + 2] = 0;
        rawData[offset + 3] = 0;
      }
    }
  }

  // Ruled horizontal lines
  for (let frac of [0.3, 0.52, 0.74]) {
    const ly = Math.round(size * frac);
    for (let x = 0; x < size; x++) {
      const offset = ly * rowBytes + 1 + x * 4;
      if (rawData[offset + 3] > 0) {
        setPx(x, ly, lineCol[0], lineCol[1], lineCol[2], 255);
        if (size >= 180) setPx(x, ly + 1, lineCol[0], lineCol[1], lineCol[2], 255);
      }
    }
  }

  // Red margin line
  const mx = Math.round(size * 0.27);
  for (let y = 0; y < size; y++) {
    const offset = y * rowBytes + 1 + mx * 4;
    if (rawData[offset + 3] > 0) {
      setPx(mx, y, redMargin[0], redMargin[1], redMargin[2], redMargin[3]);
      if (size >= 180) setPx(mx + 1, y, redMargin[0], redMargin[1], redMargin[2], redMargin[3]);
    }
  }

  // Line drawing helper
  function drawThickLine(x1, y1, x2, y2, col, thickness) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(Math.round(dist * 2), 1);
    const r = thickness / 2;
    for (let i = 0; i <= steps; i++) {
      const cx = x1 + (x2 - x1) * (i / steps);
      const cy = y1 + (y2 - y1) * (i / steps);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            setPx(Math.round(cx + dx), Math.round(cy + dy), col[0], col[1], col[2], col[3] ?? 255);
          }
        }
      }
    }
  }

  // Draw circle helper
  function drawDisc(cx, cy, r, col) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          setPx(Math.round(cx + dx), Math.round(cy + dy), col[0], col[1], col[2], col[3] ?? 255);
        }
      }
    }
  }

  function drawRing(cx, cy, r, thick, col) {
    for (let dy = -r - thick; dy <= r + thick; dy++) {
      for (let dx = -r - thick; dx <= r + thick; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 <= (r + thick/2) * (r + thick/2) && d2 >= (r - thick/2) * (r - thick/2)) {
          setPx(Math.round(cx + dx), Math.round(cy + dy), col[0], col[1], col[2], col[3] ?? 255);
        }
      }
    }
  }

  // Draw Pip!
  const s = size / 512;
  const th = Math.max(3, Math.round(18 * s));

  // Legs
  drawThickLine(270 * s, 360 * s, 220 * s, 440 * s, darkInk, th);
  drawThickLine(270 * s, 360 * s, 330 * s, 440 * s, darkInk, th);

  // Torso
  drawThickLine(270 * s, 260 * s, 270 * s, 360 * s, darkInk, th);

  // Scarf tails (fluttering backwards)
  drawThickLine(245 * s, 265 * s, 180 * s, 260 * s, scarfRed, th * 0.9);
  drawThickLine(180 * s, 260 * s, 120 * s, 280 * s, scarfRed, th * 0.9);
  drawThickLine(245 * s, 278 * s, 190 * s, 300 * s, scarfRed, th * 0.75);
  drawThickLine(190 * s, 300 * s, 150 * s, 325 * s, scarfRed, th * 0.75);

  // Scarf knot & collar
  drawDisc(270 * s, 262 * s, 28 * s, scarfRed);
  drawRing(270 * s, 262 * s, 28 * s, 4 * s, scarfDark);
  drawDisc(245 * s, 266 * s, 14 * s, scarfRed);

  // Head
  drawDisc(270 * s, 180 * s, 48 * s, paperBg);
  drawRing(270 * s, 180 * s, 48 * s, th, darkInk);

  // Eye dot
  drawDisc(290 * s, 172 * s, 9 * s, darkInk);

  // Cute pencil in hand
  drawThickLine(270 * s, 305 * s, 360 * s, 270 * s, darkInk, th * 0.75);
  drawThickLine(360 * s, 270 * s, 410 * s, 250 * s, yellowPencil, th * 1.2);
  drawDisc(418 * s, 246 * s, 7 * s, darkInk);

  return rawData;
}

function generatePNG(size, isMaskable = false) {
  const rawData = renderPipIconRGBA(size, isMaskable);
  const compressed = zlib.deflateSync(rawData);

  // IHDR data: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('/public')) {
  fs.mkdirSync('/public', { recursive: true });
}

// Generate PWA icons
fs.writeFileSync('/public/apple-touch-icon.png', generatePNG(180, false));
fs.writeFileSync('/public/pwa-192x192.png', generatePNG(192, false));
fs.writeFileSync('/public/pwa-512x512.png', generatePNG(512, false));
fs.writeFileSync('/public/pwa-maskable-512x512.png', generatePNG(512, true));

console.log('Successfully generated all PWA PNG icons!');
