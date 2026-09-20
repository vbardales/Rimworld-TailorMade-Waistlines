'use strict';
// Where the navel is drawn on WDI's bodies.
//
//   node measure-navel.js [--facing south]
//
// The navel is the only dark mark near the middle column of the belly, so:
// look at the central fifth of the body, between a fifth and three fifths of
// the way up from the hem, and take the darkest cluster of rows. Printed as a
// fraction of the body's height, the same scale the generator's --auto-height
// uses, so a waistband below the navel is a smaller number than this.

const fs = require('fs');
const { decode } = require('./png');

const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const BODIES = [
    ['Female', 'Naked_Female'], ['Male', 'Naked_Male'], ['Thin', 'Naked_Thin'],
    ['Fat', 'Naked_Fat'], ['Fat_Female', 'Naked_Fat_Female'], ['Hulk', 'Naked_Hulk'],
];

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const facing = arg('facing', 'south');

console.log(`facing ${facing}\n`);
console.log('body           navel row   as a fraction of the body');
for (const [name, source] of BODIES) {
    const file = `${WDI}/${source}_${facing}.png`;
    if (!fs.existsSync(file)) { console.log(`${name.padEnd(13)}  missing`); continue; }
    const { width: w, height: h, data } = decode(file);

    let left = w, right = -1, top = h, bottom = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < 32) continue;
        if (x < left) left = x; if (x > right) right = x;
        if (y < top) top = y; if (y > bottom) bottom = y;
    }
    const height = bottom - top;
    const cx = (left + right) / 2, band = (right - left) / 10;
    const from = Math.round(bottom - height * 0.60), to = Math.round(bottom - height * 0.20);

    // Darkness per row, over the central strip only, ignoring the inked rim.
    let best = -1, bestScore = 0;
    for (let y = from; y <= to; y++) {
        let score = 0;
        for (let x = Math.round(cx - band); x <= Math.round(cx + band); x++) {
            const i = (y * w + x) * 4;
            if (data[i + 3] < 128) continue;
            const l = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
            if (l < 190) score += 190 - l;
        }
        if (score > bestScore) { bestScore = score; best = y; }
    }
    if (best < 0) { console.log(`${name.padEnd(13)}  no mark found`); continue; }
    console.log(`${name.padEnd(13)}  ${String(best).padStart(4)}        ${((bottom - best) / height).toFixed(2)}`);
}
console.log('\n--auto-height is measured the same way: 0 at the hem, 1 at the top of the head.');
