'use strict';
// Assembles the per-body previews into one sheet: today's rendering on the left,
// the mask's on the right, one row per body type.
//
//   node montage.js [--dir south] [--scale 0.6] [--out ../Art/masks_south.png]

const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const ART = path.join(__dirname, '..', 'Art');
const BODIES = ['Female', 'Male', 'Thin', 'Fat', 'Hulk'];
const PANEL = 512, GAP = 8;

const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : fallback;
};

function cut(img, x0, y0, w, h) {
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        img.data.copy(out, y * w * 4, ((y0 + y) * img.width + x0) * 4, ((y0 + y) * img.width + x0 + w) * 4);
    }
    return { width: w, height: h, data: out };
}

function scale(img, factor) {
    const w = Math.round(img.width * factor), h = Math.round(img.height * factor);
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        const sy = Math.min(img.height - 1, Math.floor(y / factor));
        for (let x = 0; x < w; x++) {
            const sx = Math.min(img.width - 1, Math.floor(x / factor));
            img.data.copy(out, (y * w + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
        }
    }
    return { width: w, height: h, data: out };
}

function main() {
    const dir = arg('dir', 'south');
    const factor = parseFloat(arg('scale', '0.6'));
    const out = arg('out', path.join(ART, `masks_${dir}.png`));

    const rows = [];
    for (const body of BODIES) {
        const file = path.join(ART, `preview_${body}_${dir}.png`);
        if (!fs.existsSync(file)) { console.log(`${body}: no preview, skipped`); continue; }
        const img = decode(file);
        rows.push([
            scale(cut(img, PANEL + GAP, 0, PANEL, PANEL), factor),         // today
            scale(cut(img, 2 * (PANEL + GAP), 0, PANEL, PANEL), factor),   // with our mask
        ]);
    }
    if (!rows.length) return;

    const cellW = rows[0][0].width, cellH = rows[0][0].height;
    const width = cellW * 2 + GAP;
    const height = rows.length * cellH + GAP * (rows.length - 1);
    const sheet = Buffer.alloc(width * height * 4);
    rows.forEach((row, r) => {
        row.forEach((cell, c) => {
            const x0 = c * (cellW + GAP), y0 = r * (cellH + GAP);
            for (let y = 0; y < cell.height; y++) {
                cell.data.copy(sheet, ((y0 + y) * width + x0) * 4, y * cell.width * 4, (y + 1) * cell.width * 4);
            }
        });
    });
    encode(out, { width, height, data: sheet });
    console.log(`wrote ${out} (${rows.length} bodies, left: today, right: with mask)`);
}

main();
