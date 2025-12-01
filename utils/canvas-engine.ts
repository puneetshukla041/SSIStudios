// utils/canvas-engine.ts

// --- A. HELPER FUNCTIONS (Binary & DPI) ---

const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

export const setPngDpi = (base64: string, dpi: number): string => {
  const header = "data:image/png;base64,";
  const raw = atob(base64.substring(header.length));
  const uint8 = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) uint8[i] = raw.charCodeAt(i);

  const ppm = Math.round(dpi / 0.0254); // Pixels per meter
  const pngPhysChunk = new Uint8Array(21);
  const view = new DataView(pngPhysChunk.buffer);

  // Chunk Length (4 bytes), Type "pHYs" (4 bytes)
  view.setUint32(0, 9);
  pngPhysChunk.set([112, 72, 89, 115], 4); 

  // Data: X axis (4), Y axis (4), Unit specifier (1)
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  view.setUint8(16, 1); // 1 = meters

  // CRC (4 bytes)
  const crcCalc = crc32(pngPhysChunk.slice(4, 17));
  view.setUint32(17, crcCalc);

  // Inject pHYs after IHDR (usually ends at byte 33)
  // Simple injection logic: find first IDAT, inject before it, or after IHDR
  // For simplicity/reliability in this context, we inject after IHDR (byte 33 usually)
  const result = new Uint8Array(uint8.length + pngPhysChunk.length);
  result.set(uint8.slice(0, 33), 0);
  result.set(pngPhysChunk, 33);
  result.set(uint8.slice(33), 33 + pngPhysChunk.length);

  return header + btoa(String.fromCharCode(...result));
};

export const setJpegDpi = (base64: string, dpi: number): string => {
  const header = "data:image/jpeg;base64,";
  const raw = atob(base64.substring(header.length));
  const uint8 = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) uint8[i] = raw.charCodeAt(i);

  // Check for APP0 marker (0xFF E0)
  if (uint8[2] !== 0xff || uint8[3] !== 0xe0) {
    return base64; // No JFIF header found, return original
  }

  // Set Units to pixels per inch (1) -> Offset 13
  uint8[13] = 1;
  // Set X density -> Offset 14-15
  uint8[14] = dpi >> 8;
  uint8[15] = dpi & 0xff;
  // Set Y density -> Offset 16-17
  uint8[16] = dpi >> 8;
  uint8[17] = dpi & 0xff;

  return header + btoa(String.fromCharCode(...uint8));
};

// --- B. SHAPE DRAWING ---

export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const clipRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.clip();
};

export const fillRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillStyle: string
) => {
  ctx.fillStyle = fillStyle;
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.fill();
};