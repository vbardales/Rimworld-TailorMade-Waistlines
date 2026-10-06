'use strict';
// Where the garment's waistband sits, against the body it is worn on.
//
//   node measure-waist.js [--facing south]
//
// Prints, per body type, the body's alpha bounds and the garment's, and the
// waistband's height as a fraction of the body: 0 at the hem, 1 at the top of
// the head. TailorMade stretches a leg garment into the bottom 58% of the
// body's bounds, so if the rendered waist sits near 0.58 the band is what put
// it there, not the drawing.

const fs = require('fs');
const path = require('path');
const { decode } = require('./png');

const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const KAS = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3789119336/Mods/VisiblePants/Textures/Core/Things/Pawn/Humanlike/Apparel/Pants';
const BODIES = ['Female', 'Male', 'Thin', 'Fat', 'Fat_Female', 'Hulk'];

const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : fallback;
};

function bounds(file) {
    if (!fs.existsSync(file)) return null;
    const { width: w, height: h, data } = decode(file);
    let left = w, right = -1, top = h, bottom = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] < 32) continue;
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
        }
    }
    return bottom < 0 ? null : { left, right, top, bottom, w, h };
}

const facing = arg('facing', 'south');
console.log(`facing ${facing}\n`);
console.log('body           body rows     width   garment rows   width   waist');
for (const body of BODIES) {
    const b = bounds(`${WDI}/Naked_${body}_${facing}.png`);
    const g = bounds(`${KAS}/Pants_${body}_${facing}.png`);
    if (!b || !g) { console.log(`${body.padEnd(13)}  missing`); continue; }
    // 0 at the body's hem, 1 at the top of its head.
    const span = b.bottom - b.top;
    const waist = (b.bottom - g.top) / span;
    console.log(
        `${body.padEnd(13)}  ${String(b.top).padStart(3)}..${String(b.bottom).padStart(3)}` +
        `    ${String(b.right - b.left + 1).padStart(3)}     ` +
        `${String(g.top).padStart(3)}..${String(g.bottom).padStart(3)}` +
        `      ${String(g.right - g.left + 1).padStart(3)}     ${waist.toFixed(2)}`);
}
console.log('\nTailorMade stretches leg garments into the bottom 0.58 of the body.');
