'use strict';
// Reads the layers of a GIMP .xcf file: enough of the format to pull a mask
// back out of a project painted by hand, without driving GIMP.
//
// Supports XCF v0 to v11+ (pointers grow from 32 to 64 bits at v11), 8-bit
// precision, RGB/RGBA and grayscale layers, and tiles stored either raw or
// RLE-compressed. zlib-compressed tiles (compression 2) are not handled; GIMP
// still writes RLE by default.

const fs = require('fs');
const zlib = require('zlib');

const PROP_END = 0;
const PROP_OPACITY = 6;
const PROP_VISIBLE = 8;
const PROP_OFFSETS = 15;
const PROP_COMPRESSION = 17;

const COMPRESS_NONE = 0;
const COMPRESS_RLE = 1;
const COMPRESS_ZLIB = 2;

const TILE = 64;

class Reader {
    constructor(buf, pointerSize) {
        this.buf = buf;
        this.pos = 0;
        this.pointerSize = pointerSize;
    }
    u32() { const v = this.buf.readUInt32BE(this.pos); this.pos += 4; return v; }
    i32() { const v = this.buf.readInt32BE(this.pos); this.pos += 4; return v; }
    pointer() {
        if (this.pointerSize === 8) {
            const v = Number(this.buf.readBigUInt64BE(this.pos));
            this.pos += 8;
            return v;
        }
        return this.u32();
    }
    string() {
        const len = this.u32();
        if (len === 0) return '';
        const s = this.buf.toString('utf8', this.pos, this.pos + len - 1);  // drop the NUL
        this.pos += len;
        return s;
    }
    properties() {
        const props = {};
        for (;;) {
            const type = this.u32();
            const len = this.u32();
            const at = this.pos;
            if (type === PROP_END) return props;
            if (type === PROP_OPACITY) props.opacity = this.u32();
            else if (type === PROP_VISIBLE) props.visible = this.u32() !== 0;
            else if (type === PROP_COMPRESSION) props.compression = this.buf[this.pos];
            else if (type === PROP_OFFSETS) props.offsets = [this.i32(), this.i32()];
            this.pos = at + len;
        }
    }
}

// GIMP's run-length encoding, one channel plane at a time. A leading byte n
// says what follows:
//
//   n <= 126   a run of n + 1 copies of the next byte
//   n == 127   a long run: a 16-bit count, then the byte to repeat
//   n == 128   a long literal: a 16-bit count, then that many bytes
//   n >= 129   a literal of 256 - n bytes
//
// Runs come first, which is the opposite of what the widely copied description
// of the format says. Proof, on a file GIMP 3 wrote: decoded this way, a tile's
// four planes end exactly on the next tile's offset; the other way round the
// second plane already overruns.
function decodeRle(buf, start, count) {
    const out = Buffer.alloc(count);
    let src = start, dst = 0;
    while (dst < count) {
        const n = buf[src++];
        let length, value = -1;
        if (n <= 126) { length = n + 1; value = buf[src++]; }
        else if (n === 127) { length = (buf[src] << 8) | buf[src + 1]; value = buf[src + 2]; src += 3; }
        else if (n === 128) { length = (buf[src] << 8) | buf[src + 1]; src += 2; }
        else { length = 256 - n; }
        const end = Math.min(count, dst + length);
        if (value >= 0) {
            out.fill(value, dst, end);
        } else {
            buf.copy(out, dst, src, src + (end - dst));
            src += length;
        }
        dst += length;
    }
    return { data: out, end: src };
}

function readTile(buf, offset, width, height, bpp, compression) {
    const pixels = width * height;
    const planes = [];
    if (compression === COMPRESS_NONE) {
        // Interleaved, straight from the file.
        const raw = buf.slice(offset, offset + pixels * bpp);
        const out = Buffer.alloc(pixels * bpp);
        raw.copy(out);
        return out;
    }
    if (compression === COMPRESS_ZLIB) {
        const raw = zlib.inflateSync(buf.slice(offset));
        return raw.slice(0, pixels * bpp);
    }
    let at = offset;
    for (let c = 0; c < bpp; c++) {
        const { data, end } = decodeRle(buf, at, pixels);
        planes.push(data);
        at = end;
    }
    // Planes back to interleaved pixels.
    const out = Buffer.alloc(pixels * bpp);
    for (let p = 0; p < pixels; p++) {
        for (let c = 0; c < bpp; c++) out[p * bpp + c] = planes[c][p];
    }
    return out;
}

function readHierarchy(reader, buf, offset, compression) {
    reader.pos = offset;
    const width = reader.u32();
    const height = reader.u32();
    const bpp = reader.u32();
    const levels = [];
    for (;;) {
        const p = reader.pointer();
        if (p === 0) break;
        levels.push(p);
    }
    // Only the first level is the full-resolution image; the rest are mipmaps
    // GIMP keeps for itself.
    reader.pos = levels[0];
    const levelWidth = reader.u32();
    const levelHeight = reader.u32();
    const tiles = [];
    for (;;) {
        const p = reader.pointer();
        if (p === 0) break;
        tiles.push(p);
    }

    const data = Buffer.alloc(levelWidth * levelHeight * bpp);
    const across = Math.ceil(levelWidth / TILE);
    const down = Math.ceil(levelHeight / TILE);
    if (tiles.length !== across * down) {
        throw new Error(`expected ${across * down} tiles, found ${tiles.length}`);
    }
    let t = 0;
    for (let ty = 0; ty < down; ty++) {
        for (let tx = 0; tx < across; tx++, t++) {
            const tw = Math.min(TILE, levelWidth - tx * TILE);
            const th = Math.min(TILE, levelHeight - ty * TILE);
            const tile = readTile(buf, tiles[t], tw, th, bpp, compression);
            for (let y = 0; y < th; y++) {
                const row = (ty * TILE + y) * levelWidth + tx * TILE;
                tile.copy(data, row * bpp, y * tw * bpp, (y + 1) * tw * bpp);
            }
        }
    }
    return { width: levelWidth, height: levelHeight, bpp, data };
}

// Layer types, as stored: 0 RGB, 1 RGBA, 2 GRAY, 3 GRAYA, 4 INDEXED, 5 INDEXEDA.
function toRgba(hierarchy, type) {
    const { width, height, bpp, data } = hierarchy;
    const out = Buffer.alloc(width * height * 4);
    for (let p = 0; p < width * height; p++) {
        const i = p * bpp, o = p * 4;
        if (type === 1 || (bpp === 4 && type !== 3)) {
            out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = data[i + 3];
        } else if (type === 0 || bpp === 3) {
            out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = 255;
        } else if (type === 3 || bpp === 2) {
            out[o] = out[o + 1] = out[o + 2] = data[i]; out[o + 3] = data[i + 1];
        } else {
            out[o] = out[o + 1] = out[o + 2] = data[i]; out[o + 3] = 255;
        }
    }
    return { width, height, data: out };
}

function read(file) {
    const buf = fs.readFileSync(file);
    const magic = buf.toString('latin1', 0, 9);
    if (magic !== 'gimp xcf ') throw new Error(`${file}: not an XCF file`);
    const tag = buf.toString('latin1', 9, 13);
    const version = tag === 'file' ? 0 : parseInt(tag.slice(1), 10);
    const pointerSize = version >= 11 ? 8 : 4;

    const reader = new Reader(buf, pointerSize);
    reader.pos = 14;
    const width = reader.u32();
    const height = reader.u32();
    const baseType = reader.u32();
    const precision = version >= 4 ? reader.u32() : 100;
    const imageProps = reader.properties();
    const compression = imageProps.compression === undefined ? COMPRESS_NONE : imageProps.compression;

    const layerOffsets = [];
    for (;;) {
        const p = reader.pointer();
        if (p === 0) break;
        layerOffsets.push(p);
    }

    const layers = layerOffsets.map(offset => {
        reader.pos = offset;
        const lw = reader.u32();
        const lh = reader.u32();
        const type = reader.u32();
        const name = reader.string();
        const props = reader.properties();
        const hierarchyOffset = reader.pointer();
        reader.pointer();   // layer mask, not needed here
        const hierarchy = readHierarchy(reader, buf, hierarchyOffset, compression);
        return {
            name,
            type,
            width: lw,
            height: lh,
            visible: props.visible !== false,
            opacity: props.opacity === undefined ? 255 : props.opacity,
            offsets: props.offsets || [0, 0],
            image: toRgba(hierarchy, type),
        };
    });

    return { file, version, width, height, baseType, precision, compression, layers };
}

module.exports = { read };
