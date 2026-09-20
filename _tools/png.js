'use strict';
// Minimal PNG reader/writer for 8-bit RGBA, non-interlaced images.
const zlib = require('zlib');
const fs = require('fs');

function readChunks(buf) {
    if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
    const chunks = [];
    let off = 8;
    while (off < buf.length) {
        const len = buf.readUInt32BE(off);
        const type = buf.toString('ascii', off + 4, off + 8);
        chunks.push({ type, data: buf.slice(off + 8, off + 8 + len) });
        off += 12 + len;
    }
    return chunks;
}

function decode(file) {
    const chunks = readChunks(fs.readFileSync(file));
    const ihdr = chunks.find(c => c.type === 'IHDR').data;
    const width = ihdr.readUInt32BE(0);
    const height = ihdr.readUInt32BE(4);
    const depth = ihdr[8];
    const colorType = ihdr[9];
    const interlace = ihdr[12];
    // Colour types, by how many 8-bit samples a pixel carries:
    //   0 grey, 2 RGB, 4 grey + alpha, 6 RGBA. Palettes (3) are not handled;
    //   nothing in this project ships one, and they need the PLTE chunk.
    // 16-bit channels are read at their high byte: this project only ever
    // asks about shape and tone, and the low byte moves neither.
    const SAMPLES = { 0: 1, 2: 3, 4: 2, 6: 4 };
    const samples = SAMPLES[colorType];
    const bytes = depth === 16 ? 2 : 1;
    const bpp = samples * bytes;
    if ((depth !== 8 && depth !== 16) || !samples || interlace !== 0) {
        throw new Error(`${file}: unsupported (depth ${depth}, colorType ${colorType}, interlace ${interlace})`);
    }
    const idat = Buffer.concat(chunks.filter(c => c.type === 'IDAT').map(c => c.data));
    const raw = zlib.inflateSync(idat);
    const stride = width * bpp;
    const out = Buffer.alloc(height * stride);
    let pos = 0;
    for (let y = 0; y < height; y++) {
        const filter = raw[pos++];
        const line = raw.slice(pos, pos + stride);
        pos += stride;
        const cur = out.slice(y * stride, (y + 1) * stride);
        const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : null;
        for (let x = 0; x < stride; x++) {
            const a = x >= bpp ? cur[x - bpp] : 0;
            const b = prev ? prev[x] : 0;
            const c = prev && x >= bpp ? prev[x - bpp] : 0;
            let v = line[x];
            switch (filter) {
                case 0: break;
                case 1: v += a; break;
                case 2: v += b; break;
                case 3: v += (a + b) >> 1; break;
                case 4: {
                    const p = a + b - c;
                    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
                    v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
                    break;
                }
                default: throw new Error('bad filter ' + filter);
            }
            cur[x] = v & 0xff;
        }
    }
    if (colorType === 6 && bytes === 1) return { width, height, data: out };

    // Everything else is widened to 8-bit RGBA, so callers only ever see one
    // layout. `s(n)` is sample n of the pixel, at its high byte.
    const rgba = Buffer.alloc(width * height * 4);
    for (let p = 0; p < width * height; p++) {
        const i = p * bpp, o = p * 4;
        const s = n => out[i + n * bytes];
        if (colorType === 0) {                       // grey
            rgba[o] = rgba[o + 1] = rgba[o + 2] = s(0);
            rgba[o + 3] = 255;
        } else if (colorType === 4) {                // grey + alpha
            rgba[o] = rgba[o + 1] = rgba[o + 2] = s(0);
            rgba[o + 3] = s(1);
        } else {                                     // RGB, or 16-bit RGBA
            rgba[o] = s(0); rgba[o + 1] = s(1); rgba[o + 2] = s(2);
            rgba[o + 3] = colorType === 6 ? s(3) : 255;
        }
    }
    return { width, height, data: rgba };
}

function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

function encode(file, { width, height, data }) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 6;   // RGBA
    const stride = width * 4;
    const raw = Buffer.alloc(height * (stride + 1));
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0; // filter: none
        data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }
    fs.writeFileSync(file, Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]));
}

module.exports = { decode, encode };
