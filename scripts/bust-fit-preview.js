'use strict';
// Prototype of the bust fit, offline: stretches a dress in bands between the lines of the bust, so that the bodice of the
// dress meets the breasts WDI draws. Writes bust-fit-royal.png: three rows for the four female bodies, WDI's bra on the
// body (to read the lines on), the royal dress as drawn, the royal dress fitted.
//   node bust-fit-preview.js
//
// Body lines (docs/BUST-LINES.md, validated): the top of the bust of a dress is halfway between the armpit and the nipple
// (Virginie, and the strapless bodices of her photos), then the nipple, then the under breast.
// Dress lines, read on the pixels of the black outlines in the middle of the bodice (6x zoom, 2026-10-08):
//   top  = where the bodice begins, the width jump under the collar;
//   dip  = middle of the stroke at the tip of the V of the neckline (Virginie's yellow points agree to 3 rows);
//   cups = middle of the stroke that closes the cups, under the V (Thin: two thin strokes at 257 and 274).
// Then the bodice is widened to the width of the bra row by row (widen). The picture is warped on its rows first: above the top it moves as a block, between the lines each band is stretched to
// the body's, below the cups the shift fades out over FADE rows so that the hem stays where it was drawn.
const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures';
const UNA = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3352990362/Textures/Things/Pawn/Humanlike/Apparel/UNARoyalDress';
const OUT = path.join(__dirname, '..', 'docs', 'runs');
const FADE = 90;

// dress body, WDI female body, body lines [top, nipple, under], dress lines [top, dip, cups]
const SETS = [
    ['Female', 'Female', [246, 277, 308], [242, 282, 293]],
    ['Thin', 'Thin_Female', [242, 264, 289], [246, 257, 274]],
    ['Fat', 'Fat_Female', [245, 278, 321], [232, 277, 286]],
    ['Hulk', 'Hulk_Female', [269, 299, 339], [266, 310, 326]],
];

/** For each destination row, the source row it is read from (piecewise linear between the line pairs). */
function rowMap(h, body, dress) {
    const [bt, bn, bu] = body, [dt, dn, du] = dress;
    const src = new Array(h);
    for (let r = 0; r < h; r++) {
        let s;
        if (r < bt) s = r + (dt - bt);
        else if (r < bn) s = dt + (r - bt) * (dn - dt) / (bn - bt);
        else if (r < bu) s = dn + (r - bn) * (du - dn) / (bu - bn);
        else {
            const shift = du - bu;                       // how far the bust band moved the skirt
            const t = Math.min(1, (r - bu) / FADE);      // 0 right under the bust, 1 where the hem is left alone
            s = r + shift * (1 - t);
        }
        src[r] = Math.max(0, Math.min(h - 1, s));
    }
    return src;
}

function warp(img, src) {
    const out = Buffer.alloc(img.width * img.height * 4);
    for (let r = 0; r < img.height; r++) {
        const s = src[r], a = Math.floor(s), b = Math.min(img.height - 1, a + 1), f = s - a;
        for (let x = 0; x < img.width; x++) for (let k = 0; k < 4; k++)
            out[(r * img.width + x) * 4 + k] = Math.round(img.data[(a * img.width + x) * 4 + k] * (1 - f) + img.data[(b * img.width + x) * 4 + k] * f);
    }
    return { width: img.width, height: img.height, data: out };
}

/** First and last opaque column of every row, or null for an empty row. */
function extents(img) {
    const e = [];
    for (let r = 0; r < img.height; r++) {
        let l = -1, rr = -1;
        for (let x = 0; x < img.width; x++) if (img.data[(r * img.width + x) * 4 + 3] >= 128) { if (l < 0) l = x; rr = x; }
        e.push(l < 0 ? null : [l, rr]);
    }
    return e;
}

/**
 * Stretches the bodice sideways to the bra: on every row between the top of the bust and the cups, the width of the dress is
 * brought to the width of WDI's bra for the body, about the middle of the picture; the scale fades out over TAPER rows above
 * and below so that the collar and the skirt are not pulled.
 */
const TAPER = 24;
function widen(img, bra, top, cups) {
    const wd = extents(img), wb = extents(bra);
    const scale = new Array(img.height).fill(1);
    for (let r = top; r <= cups; r++) {
        if (!wd[r] || !wb[r]) continue;
        scale[r] = Math.max(0.8, Math.min(1.8, (wb[r][1] - wb[r][0]) / (wd[r][1] - wd[r][0])));
    }
    // smooth the scale over 9 rows, then fade it at both ends
    const sm = scale.map((_, r) => { let a = 0, n = 0; for (let k = -4; k <= 4; k++) { const v = scale[r + k]; if (v !== undefined) { a += v; n++; } } return a / n; });
    const out = Buffer.alloc(img.width * img.height * 4);
    const mid = img.width / 2;
    for (let r = 0; r < img.height; r++) {
        const edge = r < top ? Math.max(0, 1 - (top - r) / TAPER) : r > cups ? Math.max(0, 1 - (r - cups) / TAPER) : 1;
        const s = 1 + (sm[r] - 1) * edge;
        for (let x = 0; x < img.width; x++) {
            const sx = mid + (x - mid) / s, a = Math.floor(sx), f = sx - a;
            if (a < 0 || a + 1 >= img.width) continue;
            for (let k = 0; k < 4; k++)
                out[(r * img.width + x) * 4 + k] = Math.round(img.data[(r * img.width + a) * 4 + k] * (1 - f) + img.data[(r * img.width + a + 1) * 4 + k] * f);
        }
    }
    return { width: img.width, height: img.height, data: out };
}

const CELL = 340, X0 = 86, Y0 = 130;
const W = CELL * SETS.length, H = CELL * 3;
const canvas = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) { canvas[i * 4] = 150; canvas[i * 4 + 1] = 150; canvas[i * 4 + 2] = 140; canvas[i * 4 + 3] = 255; }

function blend(img, ox, oy) {
    if (!img) return;
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
        const sx = x + X0, sy = y + Y0;
        if (sx < 0 || sy < 0 || sx >= img.width || sy >= img.height) continue;
        const s = (sy * img.width + sx) * 4, a = img.data[s + 3] / 255;
        if (a <= 0) continue;
        const d = ((oy + y) * W + (ox + x)) * 4;
        for (let k = 0; k < 3; k++) canvas[d + k] = Math.round(img.data[s + k] * a + canvas[d + k] * (1 - a));
    }
}
function hline(ox, oy, row, rgb) {
    const y = row - Y0;
    if (y < 0 || y >= CELL) return;
    for (let x = 0; x < CELL; x++) for (let t = 0; t < 2; t++) {
        const d = ((oy + y + t) * W + ox + x) * 4;
        canvas[d] = rgb[0]; canvas[d + 1] = rgb[1]; canvas[d + 2] = rgb[2];
    }
}
const read = f => fs.existsSync(f) ? decode(f) : null;

SETS.forEach(([dressName, bodyName, body, dress], c) => {
    const bodyImg = decode(`${WDI}/Things/Pawn/Humanlike/Bodies/Naked_${bodyName}_south.png`);
    const bra = read(`${WDI}/UWUnderwear/bra/bra_${bodyName}_south.png`);
    const dressImg = decode(`${UNA}/UNARoyalDress_${dressName}_south.png`);
    const tall = warp(dressImg, rowMap(dressImg.height, body, dress));
    const fitted = bra ? widen(tall, bra, body[0], body[2]) : tall;
    const ox = c * CELL;
    // row 0: the bra on the body
    blend(bodyImg, ox, 0); blend(bra, ox, 0);
    // rows 1 and 2: the dress as drawn, then fitted
    [dressImg, fitted].forEach((d, i) => { blend(bodyImg, ox, (i + 1) * CELL); blend(d, ox, (i + 1) * CELL); });
    for (let r = 0; r < 3; r++) {
        hline(ox, r * CELL, body[0], [255, 140, 0]);   // top of the bust (halfway armpit-nipple)
        hline(ox, r * CELL, body[1], [230, 0, 0]);     // nipple
        hline(ox, r * CELL, body[2], [20, 60, 255]);   // under the breast
    }
});
const file = path.join(OUT, 'bust-fit-royal.png');
encode(file, { width: W, height: H, data: canvas });
console.log(file);
