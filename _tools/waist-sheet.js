'use strict';
// A contact sheet of one body wearing the garment at several waist heights,
// with the navel marked, so the height can be chosen by eye in one look.
//
//   node waist-sheet.js --body Male --heights 0.42,0.37,0.32
//
// It reads the `worn` panel out of the previews make-garment.js already wrote
// to Art/waist, rather than re-deriving anything: those are the images the
// choice is actually about.

const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const ROOT = path.join(__dirname, '..');
const WAIST = path.join(ROOT, 'Art', 'waist');
const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const SOURCE = { Male: 'Naked_Male', Female: 'Naked_Female', Thin: 'Naked_Thin', Fat: 'Naked_Fat', Hulk: 'Naked_Hulk' };

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const body = arg('body', 'Male');
const heights = arg('heights', '0.42,0.37,0.32').split(',');

// The navel, found the same way measure-navel.js finds it: the darkest cluster
// of rows in the central strip of the belly.
function navel(file) {
    const { width: w, height: h, data } = decode(file);
    let left = w, right = -1, top = h, bottom = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < 32) continue;
        if (x < left) left = x; if (x > right) right = x;
        if (y < top) top = y; if (y > bottom) bottom = y;
    }
    const span = bottom - top, cx = (left + right) / 2, band = (right - left) / 10;
    let best = -1, bestScore = 0;
    for (let y = Math.round(bottom - span * 0.6); y <= Math.round(bottom - span * 0.2); y++) {
        let score = 0;
        for (let x = Math.round(cx - band); x <= Math.round(cx + band); x++) {
            const i = (y * w + x) * 4;
            if (data[i + 3] < 128) continue;
            const l = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
            if (l < 190) score += 190 - l;
        }
        if (score > bestScore) { bestScore = score; best = y; }
    }
    return best;
}

// The preview is three 512 panels with an 8px gutter between and around them;
// the middle one is the pawn wearing the garment. Only the waist is of any
// interest, and a pixel at 512 is an eighth of a pixel on the pawn - so the
// band around the navel is cut out and doubled, or the choice is invisible.
const CROP = { up: 70, down: 130, ZOOM: 2 };

function wornPanel(file, navelRow) {
    const img = decode(file);
    const panel = 512, gap = Math.round((img.width - panel * 3) / 4);
    const x0 = gap * 2 + panel, y0 = Math.round((img.height - panel) / 2);
    const top = navelRow - CROP.up, cw = panel, ch = CROP.up + CROP.down;
    const z = CROP.ZOOM, W = cw * z, H = ch * z;
    const out = Buffer.alloc(W * H * 4);
    for (let y = 0; y < H; y++) {
        const sy = Math.min(img.height - 1, y0 + top + Math.floor(y / z));
        for (let x = 0; x < W; x++) {
            const from = (sy * img.width + x0 + Math.floor(x / z)) * 4, to = (y * W + x) * 4;
            for (let k = 0; k < 4; k++) out[to + k] = img.data[from + k];
        }
    }
    return { width: W, height: H, data: out, navel: CROP.up * z };
}

const navelRow = navel(`${WDI}/${SOURCE[body]}_south.png`);
const panels = heights.map(h => ({ h, img: wornPanel(path.join(WAIST, `${body}_h${h}.png`), navelRow) }));

const pw = panels[0].img.width, ph = panels[0].img.height;
const gap = 6, W = panels.length * pw + (panels.length + 1) * gap, H = ph + gap * 2;
const sheet = Buffer.alloc(W * H * 4);
for (let p = 0; p < W * H; p++) {
    const i = p * 4;
    sheet[i] = 24; sheet[i + 1] = 25; sheet[i + 2] = 28; sheet[i + 3] = 255;
}
panels.forEach((panel, n) => {
    const x0 = gap + n * (pw + gap);
    for (let y = 0; y < ph; y++) {
        for (let x = 0; x < pw; x++) {
            const from = (y * pw + x) * 4, to = ((y + gap) * W + x0 + x) * 4;
            const a = panel.img.data[from + 3] / 255;
            for (let k = 0; k < 3; k++) {
                sheet[to + k] = Math.round(panel.img.data[from + k] * a + sheet[to + k] * (1 - a));
            }
        }
    }
    // The navel's row, drawn across the panel in red: the line the waistband
    // has to stay under.
    for (let x = 0; x < pw; x++) {
        const to = ((panel.img.navel + gap) * W + x0 + x) * 4;
        sheet[to] = 220; sheet[to + 1] = 60; sheet[to + 2] = 60; sheet[to + 3] = 255;
    }
});

const target = path.join(ROOT, 'Art', `waist_${body}.png`);
encode(target, { width: W, height: H, data: sheet });
console.log(`wrote ${path.relative(ROOT, target)}: ${heights.join(', ')}, navel at row ${navelRow}`);
