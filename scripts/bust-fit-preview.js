'use strict';
// Prototype of the bust fit, offline: stretches a dress in bands between the lines of the bust, so that the bodice of the
// dress meets the breasts WDI draws. Writes before / after pictures of the royal dress on the four female bodies.
//   node bust-fit-preview.js
//
// Body lines (docs/BUST-LINES.md, validated): armpit, nipple, under breast.
// Dress lines: top of the bust (PROVISIONAL), neckline dip (Virginie's yellow points), bottom of the bust (PROVISIONAL).
// The picture is warped on its rows only: above the armpit it moves as a block, between the lines each band is stretched
// to the body's, below the bust the shift fades out over FADE rows so that the hem stays where it was drawn.
const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const UNA = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3352990362/Textures/Things/Pawn/Humanlike/Apparel/UNARoyalDress';
const OUT = path.join(__dirname, '..', 'docs', 'runs');
const FADE = 90;

// dress body, WDI female body, body lines [armpit, nipple, under], dress lines [top, dip, bottom]
const SETS = [
    ['Female', 'Female', [216, 277, 308], [242, 281, 295]],
    ['Thin', 'Thin_Female', [219, 264, 289], [242, 270, 278]],
    ['Fat', 'Fat_Female', [212, 278, 321], [226, 277, 297]],
    ['Hulk', 'Hulk_Female', [238, 299, 339], [266, 311, 320]],
];

/** For each destination row, the source row it is read from (piecewise linear between the line pairs). */
function rowMap(h, body, dress) {
    const [ba, bn, bu] = body, [da, dn, du] = dress;
    const src = new Array(h);
    for (let r = 0; r < h; r++) {
        let s;
        if (r < ba) s = r + (da - ba);
        else if (r < bn) s = da + (r - ba) * (dn - da) / (bn - ba);
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

const CELL = 340, X0 = 86, Y0 = 130;
const W = CELL * SETS.length, H = CELL * 2;
const canvas = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) { canvas[i * 4] = 150; canvas[i * 4 + 1] = 150; canvas[i * 4 + 2] = 140; canvas[i * 4 + 3] = 255; }

function blend(img, ox, oy, x0, y0, w, h) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const sx = x + x0, sy = y + y0;
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

SETS.forEach(([dressName, bodyName, body, dress], c) => {
    const bodyImg = decode(`${WDI}/Naked_${bodyName}_south.png`);
    const dressImg = decode(`${UNA}/UNARoyalDress_${dressName}_south.png`);
    const fitted = warp(dressImg, rowMap(dressImg.height, body, dress));
    [dressImg, fitted].forEach((d, r) => {
        const ox = c * CELL, oy = r * CELL;
        blend(bodyImg, ox, oy, X0, Y0, CELL, CELL);
        blend(d, ox, oy, X0, Y0, CELL, CELL);
        hline(ox, oy, body[0], [255, 140, 0]);   // armpit
        hline(ox, oy, body[1], [230, 0, 0]);     // nipple
        hline(ox, oy, body[2], [20, 60, 255]);   // under the breast
    });
});
const file = path.join(OUT, 'bust-fit-royal.png');
encode(file, { width: W, height: H, data: canvas });
console.log(file);
