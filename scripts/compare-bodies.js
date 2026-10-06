'use strict';
// How close each body retexture is to the one we build for.
//
//   node compare-bodies.js                  # against WDI's Realistic Bodies
//   node compare-bodies.js --against "Scrubdaddy's Bodies"
//   node compare-bodies.js --body Female    # one body type only
//
// The question this answers is not "do they look alike" but "would apparel
// drawn for that mod sit correctly on this one". So it compares silhouettes,
// not pixels: the alpha channel of the naked body, which is exactly what a
// garment has to fill.
//
//   overlap   intersection over union of the two silhouettes, 0 to 1. Above
//             about 0.95 the two bodies are interchangeable for apparel; below
//             0.85 a garment drawn for one will hang off the other.
//   width     the reference's width minus theirs, in pixels at 512. Positive
//             means their body is narrower.
//   hem       the same for the bottom row: positive means their body stops
//             higher up.
//
// Both are reported as the worst case over the body types compared, not the
// average, because one bad body type is enough to make a patch unusable.

const fs = require('fs');
const path = require('path');
const { decode } = require('./png');

const MODS = JSON.parse(fs.readFileSync(path.join(__dirname, 'body-mods.json'), 'utf8'));
const BODIES = ['Female', 'Male', 'Thin', 'Thin_Female', 'Fat', 'Fat_Female',
    'Hulk', 'Hulk_Female', 'Child'];
const FACINGS = ['south', 'north', 'east'];

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const referenceName = arg('against', "WDI's Realistic Bodies");
const onlyBody = arg('body', null);

const fileFor = (mod, body, facing) => mod.dir + '/' +
    (mod.pattern || 'Naked_{body}{suffix}_{facing}.png')
        .replace('{body}', body)
        .replace('{suffix}', mod.suffix || '')
        .replace('{facing}', facing);

// Everything is resampled to this grid before being compared. Mods are drawn
// at 256, 512 or 1024, and the game scales them all to the same square on the
// map, so the resolution says nothing about the size of the body. Comparing
// raw pixels would call a 256 texture half as wide as an identical 512 one.
const GRID = 512;

// The silhouette, on that grid, plus where it sits. Cached: the reference is
// read once per slot rather than once per mod.
const cache = new Map();
function shape(file) {
    if (cache.has(file)) return cache.get(file);
    let value = null;
    if (fs.existsSync(file)) {
        const { width: w, height: h, data } = decode(file);
        const set = new Uint8Array(GRID * GRID);
        let left = GRID, right = -1, top = GRID, bottom = -1, count = 0;
        for (let y = 0; y < GRID; y++) {
            const sy = Math.min(h - 1, Math.floor(y * h / GRID));
            for (let x = 0; x < GRID; x++) {
                const sx = Math.min(w - 1, Math.floor(x * w / GRID));
                if (data[(sy * w + sx) * 4 + 3] < 32) continue;
                set[y * GRID + x] = 1;
                count++;
                if (x < left) left = x;
                if (x > right) right = x;
                if (y < top) top = y;
                if (y > bottom) bottom = y;
            }
        }
        if (count) value = { set, left, right, top, bottom, source: `${w}x${h}` };
    }
    cache.set(file, value);
    return value;
}

function overlap(a, b) {
    let both = 0, either = 0;
    for (let p = 0; p < a.set.length; p++) {
        if (a.set[p] && b.set[p]) both++;
        if (a.set[p] || b.set[p]) either++;
    }
    return either ? both / either : 0;
}

const reference = MODS.find(m => m.label === referenceName);
if (!reference) {
    console.error(`no mod called "${referenceName}" in body-mods.json`);
    process.exit(2);
}

const bodies = onlyBody ? [onlyBody] : BODIES;
console.log(`against ${reference.label}${onlyBody ? `, ${onlyBody} only` : ''}\n`);
console.log('mod                              slots   overlap          width    hem');

const rows = [];
const garments = [];
for (const mod of MODS) {
    if (mod === reference) continue;
    // A garment is not a silhouette to overlap with a body - it covers only
    // part of one. It still answers the question it was added for: how far
    // down the body it was drawn for reaches.
    if (mod.kind === 'apparel') {
        for (const body of bodies) {
            for (const facing of FACINGS) {
                const a = shape(fileFor(reference, body, facing));
                const b = shape(fileFor(mod, body, facing));
                if (!a || !b) continue;
                garments.push({
                    label: mod.label, body, facing,
                    width: (a.right - a.left) - (b.right - b.left),
                    hem: a.bottom - b.bottom,
                });
            }
        }
        continue;
    }
    let slots = 0, worst = 1, sum = 0, width = 0, hem = 0, sizeMismatch = 0;
    for (const body of bodies) {
        for (const facing of FACINGS) {
            const a = shape(fileFor(reference, body, facing));
            const b = shape(fileFor(mod, body, facing));
            if (!a || !b) continue;
            const o = overlap(a, b);
            if (o === null) { sizeMismatch++; continue; }
            slots++;
            sum += o;
            if (o < worst) worst = o;
            const dw = (a.right - a.left) - (b.right - b.left);
            const dh = a.bottom - b.bottom;
            if (Math.abs(dw) > Math.abs(width)) width = dw;
            if (Math.abs(dh) > Math.abs(hem)) hem = dh;
        }
    }
    if (!slots) {
        console.log(`${mod.label.padEnd(32)}  ${String(sizeMismatch).padStart(4)}   ` +
            (sizeMismatch ? 'canvas size differs' : 'no shared body type'));
        continue;
    }
    rows.push({ mod, slots, worst, mean: sum / slots, width, hem });
}

rows.sort((x, y) => y.mean - x.mean);
for (const r of rows) {
    const sign = n => (n > 0 ? '+' : '') + n;
    console.log(
        `${r.mod.label.padEnd(32)}  ${String(r.slots).padStart(4)}   ` +
        `${r.mean.toFixed(3)} mean, ${r.worst.toFixed(3)} worst   ` +
        `${sign(r.width).padStart(5)}  ${sign(r.hem).padStart(5)}`);
}

console.log('\nwidth and hem are the reference minus theirs, in pixels at 512,');
console.log('taken at whichever body type disagrees most.');

// The Core stand-in. RimWorld ships no loose body texture, so the vanilla
// silhouette can only be read off something drawn for it - here the pants of
// a visible-pants mod, whose hem is where the vanilla body's legs end.
if (garments.length) {
    console.log('\nDrawn for the vanilla body, which has no texture on disk:');
    console.log('\nsource                           body          width    hem');
    const by = new Map();
    for (const g of garments) {
        const key = `${g.label}|${g.body}`;
        const seen = by.get(key);
        if (!seen || Math.abs(g.hem) > Math.abs(seen.hem)) by.set(key, g);
    }
    const sign = n => (n > 0 ? '+' : '') + n;
    for (const g of [...by.values()]) {
        console.log(`${g.label.padEnd(32)}  ${g.body.padEnd(12)}  ` +
            `${sign(g.width).padStart(5)}  ${sign(g.hem).padStart(5)}`);
    }
    console.log('\nA garment covers less than a body, so width is not comparable;');
    console.log('the hem is, and a negative one means the vanilla legs run lower.');
}
