'use strict';
// Is there an anchor for the waistband that the body itself provides?
//
//   node measure-waist-anchor.js [--facing south]
//
// The navel works, but it is a drawn mark: it depends on the artist bothering
// to draw one, and on it being the darkest thing in the middle of the belly.
// A geometric anchor would survive any retexture. The obvious candidate is the
// narrowest row of the silhouette in the lower half - the waist, in the sense
// a tailor means.
//
// This prints both, for every body of every mod in body-mods.json, so the two
// can be compared: if the narrowest row tracks the navel across mods, the band
// can be derived at run time and the slider becomes an offset instead of an
// absolute height.

const fs = require('fs');
const path = require('path');
const { decode } = require('./png');

const MODS = JSON.parse(fs.readFileSync(path.join(__dirname, 'body-mods.json'), 'utf8'))
    .filter(m => m.kind !== 'apparel');
const BODIES = ['Female', 'Male', 'Thin', 'Fat', 'Hulk'];

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const facing = arg('facing', 'south');

const fileFor = (mod, body) => mod.dir + '/' +
    (mod.pattern || 'Naked_{body}{suffix}_{facing}.png')
        .replace('{body}', body).replace('{suffix}', mod.suffix || '').replace('{facing}', facing);

function measure(file) {
    if (!fs.existsSync(file)) return null;
    const { width: w, height: h, data } = decode(file);

    const widthAt = new Int32Array(h);
    let left = w, right = -1, top = h, bottom = -1;
    for (let y = 0; y < h; y++) {
        let a = w, b = -1;
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] < 32) continue;
            if (x < a) a = x;
            if (x > b) b = x;
        }
        if (b < 0) continue;
        widthAt[y] = b - a + 1;
        if (a < left) left = a;
        if (b > right) right = b;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
    }
    if (bottom < 0) return null;
    const span = bottom - top;

    // The waist: the narrowest row between a fifth and two thirds of the way up
    // from the hem. Below that is the seat, above it the ribs, and both are
    // wider on every body ever drawn.
    let waist = -1, narrowest = Infinity;
    for (let y = Math.round(bottom - span * 0.66); y <= Math.round(bottom - span * 0.20); y++) {
        if (!widthAt[y]) continue;
        if (widthAt[y] < narrowest) { narrowest = widthAt[y]; waist = y; }
    }

    // The navel, as measure-navel.js finds it.
    const cx = (left + right) / 2, band = (right - left) / 10;
    let navel = -1, best = 0;
    for (let y = Math.round(bottom - span * 0.60); y <= Math.round(bottom - span * 0.20); y++) {
        let score = 0;
        for (let x = Math.round(cx - band); x <= Math.round(cx + band); x++) {
            const i = (y * w + x) * 4;
            if (data[i + 3] < 128) continue;
            const l = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
            if (l < 190) score += 190 - l;
        }
        if (score > best) { best = score; navel = y; }
    }

    return {
        waist: (bottom - waist) / span,
        navel: navel < 0 ? null : (bottom - navel) / span,
    };
}

console.log(`facing ${facing}\n`);
console.log('mod                            body      waist   navel   gap');
const gaps = [];
for (const mod of MODS) {
    for (const body of BODIES) {
        const m = measure(fileFor(mod, body));
        if (!m) continue;
        const gap = m.navel === null ? null : m.navel - m.waist;
        if (gap !== null) gaps.push(gap);
        console.log(`${mod.label.slice(0, 28).padEnd(30)} ${body.padEnd(8)}  ` +
            `${m.waist.toFixed(2)}    ${m.navel === null ? '  -- ' : m.navel.toFixed(2)}   ` +
            `${gap === null ? '' : (gap >= 0 ? '+' : '') + gap.toFixed(2)}`);
    }
}
if (gaps.length) {
    const sorted = [...gaps].sort((a, b) => a - b);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    console.log(`\nnavel minus waist over ${gaps.length} bodies: ` +
        `mean ${mean.toFixed(3)}, from ${sorted[0].toFixed(2)} to ${sorted[sorted.length - 1].toFixed(2)}`);
    console.log('A tight spread means the waist alone can place the band, and the');
    console.log('slider becomes an offset from it rather than an absolute height.');
}
