'use strict';
// How thick the drawn black edge is, on the body and on the garment.
//
//   node measure-outline.js [--facing south]
//
// For each opaque row, walks in from the left and from the right and counts
// how many pixels are ink before the fill starts. The median of those runs is
// the outline weight. A garment whose outline is heavier than the body's reads
// as a thick black border once the two are drawn on top of each other.

const fs = require('fs');
const { decode } = require('./png');

const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const KAS = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3789119336/Mods/VisiblePants/Textures/Core/Things/Pawn/Humanlike/Apparel/Pants';
const OURS = require('path').join(__dirname, '..', 'Mod/Textures/Things/TailoredPants/Apparel/Pants');
const BODIES = ['Female', 'Male', 'Thin', 'Fat', 'Hulk'];
const INK = 96;   // a pixel this dark or darker counts as outline

const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : fallback;
};

const median = a => a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0;

function outline(file) {
    if (!fs.existsSync(file)) return null;
    const { width: w, height: h, data } = decode(file);
    const runs = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] >= 128) row.push(x);
        if (row.length < 8) continue;
        for (const [from, step] of [[row[0], 1], [row[row.length - 1], -1]]) {
            let n = 0;
            for (let x = from; x >= 0 && x < w; x += step) {
                const i = (y * w + x) * 4;
                if (data[i + 3] < 128) break;
                const l = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
                if (l > INK) break;
                n++;
            }
            if (n) runs.push(n);
        }
    }
    return { median: median(runs), rows: runs.length };
}

const facing = arg('facing', 'south');
console.log(`facing ${facing}\n`);
console.log('body           WDI body   Kas pants   interpreted');
for (const body of BODIES) {
    const b = outline(`${WDI}/Naked_${body}_${facing}.png`);
    const k = outline(`${KAS}/Pants_${body}_${facing}.png`);
    const o = outline(`${OURS}/Pants_${body}_${facing}.png`);
    const show = r => r ? String(r.median).padStart(4) + 'px' : '   --';
    console.log(`${body.padEnd(13)}  ${show(b)}      ${show(k)}       ${show(o)}`);
}
console.log('\nmeasured at 512; the pawn is drawn far smaller, so every pixel here counts.');
