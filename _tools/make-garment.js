'use strict';
// Turns a mask - the shape of the garment, painted by hand - into an actual
// worn texture: flat cloth, shaded the way WDI shades its bodies, inside a
// black outline of the same weight.
//
//   node make-garment.js [--body Female] [--all] [--preview]
//
// RimWorld multiplies a worn texture by the stuff colour, so the cloth is kept
// pale: white is full colour, and the shading is what survives the tint. The
// outline stays dark, as vanilla apparel does.
//
// Output: Mod/Textures/Things/TailoredPants/Apparel/Pants/Pants_<Body>_<facing>.png

const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const BODIES = require('./bodies');
const MASKS = path.join(__dirname, '..', 'Mod', 'Textures', 'Things', 'TailoredPants');
const OUT = path.join(MASKS, 'Apparel', 'Pants');
const ART = path.join(__dirname, '..', 'Art');
const PANTIES = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/UWUnderwear/panties';
const BODY_ART = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const DIRS = ['south', 'north', 'east'];

const num = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? parseFloat(process.argv[i + 1]) : fallback;
};

const OUTLINE = num('outline', 6);      // black rim, in pixels, as thick as WDI's
const HOLE_OUTLINE = num('hole-outline', 2); // and the thinner line around a hole she cut      // black rim, in pixels, as thick as WDI's
const EDGE_SHADE = num('edge-shade', 16); // how far inside the cloth darkens, in pixels
const EDGE_DEPTH = num('edge-depth', 0.12); // and by how much, at the very edge
const TOP_LIGHT = num('top-light', 0.02);   // extra light at the waist, fading down
const WAISTBAND = num('waistband', 12);     // waistband height, in pixels
const SEAM = num('seam', 2);                // and the grey line that closes it underneath
const CLOTH = num('cloth', 253);                      // the base tone of the cloth
const SHADE_STRENGTH = num('shade-strength', 1); // how much the tones painted into the mask count
const SHADE_MEDIAN = num('shade-median', 3);     // median filter over those tones, in pixels
const LEVELS = num('levels', 5);                 // cel-shading steps; 1 keeps the smooth gradient
const ZONES = num('zones', 1);                   // 1 draws the seams and gusset, 0 leaves the cloth plain
const SEAM_WIDTH = num('seam-width', 4);   // centre seam, measured on WDI's longjohns
const SEAM_TONE = num('seam-tone', 0.71);  // its tone: 179 against cloth at 253
const ARC_WIDTH = num('arc-width', 3);     // the groin arc each side
const ARC_TONE = num('arc-tone', 0.80);
const TUBE = num('tube', 1);            // shade each run of cloth as a cylinder
const TUBE_DEPTH = num('tube-depth', 0.22); // how dark its sides go
const TUBE_AXIS = (process.argv.indexOf('--tube-axis') >= 0 ? process.argv[process.argv.indexOf('--tube-axis') + 1] : 'vertical'); // how dark its sides go
const SUPER = num('super', 2);          // supersampling factor, for anti-aliased edges
const SMOOTH = num('smooth', 1.5);      // radius, in final pixels, the shape's contour is rounded by
const INK = num('ink', 0);              // the outline tone; WDI inks his bodies at 0          // supersampling factor, for anti-aliased edges
const AUTO = num('auto', 0);            // no mask at all: the body decides the shape
const AUTO_HEIGHT = num('auto-height', 0.42); // how far up the body the garment reaches
const AUTO_INSET = num('auto-inset', 6);      // and how far inside the body's outline it stops
const SOURCE = (process.argv.indexOf('--source') >= 0 ? process.argv[process.argv.indexOf('--source') + 1] : null);
const FROM_PANTIES = num('from-panties', 0);     // top from WDI's panties, legs derived
const PANTIES_HEM = (process.argv.indexOf('--panties-hem') >= 0 ? process.argv[process.argv.indexOf('--panties-hem') + 1] : 'seam'); // keep | seam | erase
const PANTIES_SEAM_TONE = num('panties-seam-tone', 190);
const PANTIES_PASSES = num('panties-passes', 60);     // top from WDI's panties, legs derived
const FROM_PAINT = num('from-paint', 1);         // her mask IS the texture; only the outline is added
const FROM_BODY = num('from-body', 1);           // the cloth is cut from the body art itself
const CROTCH_INK = num('crotch-ink', 1);         // the crotch is inked, not shaded
const CROTCH_HEIGHT = num('crotch-height', 0.30);// over this share of the garment's height
const CROTCH_TOP_WIDTH = num('crotch-top', 5);   // 5 px where it starts, as on the body
const CROTCH_HEM_WIDTH = num('crotch-hem', 12);  // widening to 12 at the hem

// Chamfer distance to the nearest pixel outside the set, in pixels.
function distanceInside(set, w, h) {
    const INF = 1e6;
    const d = new Float32Array(w * h).fill(INF);
    for (let p = 0; p < w * h; p++) if (!set[p]) d[p] = 0;
    const look = (x, y, cost, best) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return 0;   // outside the canvas is outside the set
        const v = d[y * w + x] + cost;
        return v < best ? v : best;
    };
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const p = y * w + x;
            if (!set[p]) continue;
            let best = d[p];
            best = look(x - 1, y, 1, best);
            best = look(x, y - 1, 1, best);
            best = look(x - 1, y - 1, 1.41, best);
            best = look(x + 1, y - 1, 1.41, best);
            d[p] = best;
        }
    }
    for (let y = h - 1; y >= 0; y--) {
        for (let x = w - 1; x >= 0; x--) {
            const p = y * w + x;
            if (!set[p]) continue;
            let best = d[p];
            best = look(x + 1, y, 1, best);
            best = look(x, y + 1, 1, best);
            best = look(x + 1, y + 1, 1.41, best);
            best = look(x - 1, y + 1, 1.41, best);
            d[p] = best;
        }
    }
    return d;
}

// Distance to the nearest pixel of the set, for pixels outside it.
function distanceOutside(set, w, h) {
    const flipped = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) flipped[p] = set[p] ? 0 : 1;
    return distanceInside(flipped, w, h);
}

// Which empty pixels are the outside world, and which are holes the garment
// encloses. The outline may only be drawn at full weight around the outside: a
// hole at the crotch, which she cuts on purpose, was being ringed with 6 px of
// black from every side and filled in as a blob.
function outerRegion(set, w, h) {
    const outer = new Uint8Array(w * h);
    const stack = [];
    const push = p => { if (!outer[p] && !set[p]) { outer[p] = 1; stack.push(p); } };
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
    while (stack.length) {
        const p = stack.pop();
        const x = p % w, y = (p - x) / w;
        if (x > 0) push(p - 1);
        if (x < w - 1) push(p + 1);
        if (y > 0) push(p - w);
        if (y < h - 1) push(p + w);
    }
    return outer;
}

// Tube shading: cloth wrapped round a limb is lit along the middle of that limb
// and falls off to both sides. Taken row by row, each run of cloth is treated as
// its own cylinder - so below the crotch each leg gets its own light, which is
// what makes them read as two tubes instead of one flat patch. Above the crotch
// the single run is the hips, one wider cylinder.
function tubeShading(set, w, h) {
    const factor = new Float32Array(w * h).fill(1);
    // A vertical tube falls off left to right, so it is measured along the rows;
    // a horizontal one - a waistband, a cuff - falls off top to bottom, along
    // the columns. She can only draw straight gradients in GIMP, never an
    // ellipse, which is exactly why this is computed here.
    if (TUBE_AXIS === 'horizontal') {
        for (let x = 0; x < w; x++) {
            let inRun = false, start = 0;
            for (let y = 0; y <= h; y++) {
                const solid = y < h && set[y * w + x];
                if (solid && !inRun) { inRun = true; start = y; }
                else if (!solid && inRun) {
                    inRun = false;
                    const end = y - 1, centre = (start + end) / 2, half = Math.max(1, (end - start) / 2);
                    for (let q = start; q <= end; q++) {
                        const t = Math.abs(q - centre) / half;
                        factor[q * w + x] = 1 - TUBE_DEPTH * t * t;
                    }
                }
            }
        }
        return factor;
    }
    for (let y = 0; y < h; y++) {
        let inRun = false, start = 0;
        for (let x = 0; x <= w; x++) {
            const solid = x < w && set[y * w + x];
            if (solid && !inRun) { inRun = true; start = x; }
            else if (!solid && inRun) {
                inRun = false;
                const end = x - 1;
                const centre = (start + end) / 2;
                const half = Math.max(1, (end - start) / 2);
                for (let q = start; q <= end; q++) {
                    const t = Math.abs(q - centre) / half;          // 0 in the middle, 1 at a side
                    factor[y * w + q] = 1 - TUBE_DEPTH * t * t;
                }
            }
        }
    }
    return factor;
}

function maskSet(img) {
    const set = new Uint8Array(img.width * img.height);
    for (let p = 0; p < set.length; p++) set[p] = img.data[p * 4 + 3] >= 128 ? 1 : 0;
    return set;
}

function verticalRange(set, w, h) {
    let top = h, bottom = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (set[y * w + x]) { if (y < top) top = y; if (y > bottom) bottom = y; break; }
        }
    }
    return { top, bottom };
}

// Her rule, and it is a good one: the line between the thighs must be no
// thicker than the cloth that is left at the hem. Painted by hand the gap
// widens towards the bottom - 3 px at the top of the crotch, 27 px at the hem
// on the female body, where only 16 px of cloth remain each side - and the
// outline then fills it from both sides into a fat dark band instead of a line.
// So the two edges facing the gap are grown inwards until it is thin enough.
function narrowCrotch(set, w, h, limitPixels) {
    const rows = [];
    for (let y = 0; y < h; y++) {
        const runs = [];
        let inRun = false, start = 0;
        for (let x = 0; x < w; x++) {
            const s = set[y * w + x];
            if (s && !inRun) { inRun = true; start = x; }
            else if (!s && inRun) { inRun = false; runs.push([start, x - 1]); }
        }
        if (inRun) runs.push([start, w - 1]);
        rows.push(runs);
    }

    // The cloth left at the hem, per side: the narrowest the gap may be asked
    // to respect, so a thin hem is never made to touch.
    let hemCloth = Infinity;
    for (let y = h - 1; y >= 0; y--) {
        if (rows[y].length >= 2) {
            hemCloth = Math.min(...rows[y].map(r => r[1] - r[0] + 1));
            break;
        }
    }
    const limit = Math.max(2, Math.min(limitPixels, hemCloth));

    // The crotch starts below the last unbroken row. Above it, a gap that
    // straddles the middle is the waistline dipping between the hip points -
    // the V of a low waist - and narrowing that cut a slot into the waistband.
    let crotchStart = -1;
    for (let y = 0; y < h; y++) if (rows[y].length === 1) crotchStart = y;

    let narrowed = 0;
    for (let y = crotchStart + 1; y < h; y++) {
        const runs = rows[y];
        if (runs.length < 2) continue;
        const centre = w / 2;
        // The gap that straddles the middle of the body.
        for (let i = 0; i < runs.length - 1; i++) {
            const left = runs[i], right = runs[i + 1];
            const gapStart = left[1] + 1, gapEnd = right[0] - 1;
            const gap = gapEnd - gapStart + 1;
            if (gap <= limit) continue;
            if (gapStart > centre || gapEnd < centre) continue;   // not the crotch
            const grow = Math.floor((gap - limit) / 2);
            for (let x = gapStart; x < gapStart + grow; x++) set[y * w + x] = 1;
            for (let x = gapEnd; x > gapEnd - grow; x--) set[y * w + x] = 1;
            narrowed++;
        }
    }
    return { narrowed, limit };
}

// Soft brush strokes wobble: a 3x3 median firms their edges without moving
// them, which a blur would.
function medianFilter(img, radius) {
    if (radius <= 0) return img;
    const { width: w, height: h, data } = img;
    const out = Buffer.from(data);
    const window = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const p = (y * w + x) * 4;
            if (!data[p + 3]) continue;
            window.length = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) continue;
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx;
                    if (nx < 0 || nx >= w) continue;
                    const q = (ny * w + nx) * 4;
                    if (data[q + 3]) window.push(data[q]);
                }
            }
            window.sort((a, b) => a - b);
            const v = window[Math.floor(window.length / 2)];
            out[p] = out[p + 1] = out[p + 2] = v;
        }
    }
    return { width: w, height: h, data: out };
}

// Cel shading: the tone is snapped to a few steps, so the cloth reads as firm
// patches instead of a hesitant gradient.
function quantise(tone, levels) {
    if (levels <= 1) return tone;
    const lo = 150, hi = 255;   // measured on WDI's own underwear: cloth sits at 250, only its edges reach 170
    const t = Math.max(0, Math.min(1, (tone - lo) / (hi - lo)));
    return lo + Math.round(t * (levels - 1)) / (levels - 1) * (hi - lo);
}

// The zones she drew by hand, derived from the silhouette instead: the two
// groin arcs, the gusset panel with its seam, the centre seam. Measured off her
// own female mask - a gusset about 40 px wide and 60 tall, stopping short of the
// hem, arcs leaving the hips at a third of the width - then scaled to whatever
// body the mask belongs to.
function drawZones(set, w, h) {
    const shade = Buffer.alloc(w * h * 4);
    for (let p = 0; p < w * h; p++) {
        if (!set[p]) continue;
        shade[p * 4] = shade[p * 4 + 1] = shade[p * 4 + 2] = 128;   // neutral
        shade[p * 4 + 3] = 255;
    }

    // The garment's own measurements.
    let top = h, bottom = -1, left = w, right = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!set[y * w + x]) continue;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
            if (x < left) left = x;
            if (x > right) right = x;
        }
    }
    if (bottom < 0) return shade;
    const centre = Math.round((left + right) / 2);
    const width = right - left + 1;
    const height = bottom - top + 1;

    const paint = (x, y, factor) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const p = y * w + x;
        if (!set[p]) return;
        shade[p * 4] = shade[p * 4 + 1] = shade[p * 4 + 2] = Math.round(128 * factor);
    };

    // Measured on WDI's own longjohns, not invented: there is NO gusset panel.
    // The crotch is said with lines only - a centre seam about 4 px wide at tone
    // 179 against cloth at 253, so a factor of 0.71, and a thin arc each side.
    // A panel, which this drew first, is foreign to that art and reads as a
    // patch sewn on.
    const seamHalf = Math.max(1, Math.round(SEAM_WIDTH / 2));
    for (let y = top + WAISTBAND + SEAM; y <= bottom; y++) {
        for (let k = -seamHalf; k <= seamHalf; k++) paint(centre + k, y, SEAM_TONE);
    }

    // The two groin arcs, from the hips inwards and down to the seam.
    const arcFrom = Math.round(width * 0.34);
    const arcTop = bottom - Math.round(height * 0.42);
    const arcBottom = bottom - Math.round(height * 0.12);
    for (const side of [-1, 1]) {
        for (let step = 0; step <= 160; step++) {
            const t = step / 160;
            const x = Math.round(centre + side * (arcFrom * (1 - t) + seamHalf * t));
            const y = Math.round(arcTop + (arcBottom - arcTop) * Math.sqrt(t));
            for (let k = 0; k < ARC_WIDTH; k++) paint(x, y + k, ARC_TONE);
        }
    }
    return { width: w, height: h, data: shade };
}

// Her idea, and the best of the lot: the garment is the BODY's own pixels,
// clipped to the mask. The shading, the inked crotch and the line weight then
// come from WDI's art instead of being imitated. The tones are lifted so the
// median lands on the cloth value, otherwise the garment would take the tint of
// skin and come out dark.
function fromBody(mask, body) {
    const { width: w, height: h } = mask;
    const set = maskSet(mask);
    const tones = [];
    for (let p = 0; p < w * h; p++) {
        if (!set[p] || body.data[p * 4 + 3] < 32) continue;
        const l = body.data[p * 4] * 0.3 + body.data[p * 4 + 1] * 0.59 + body.data[p * 4 + 2] * 0.11;
        if (l > 60) tones.push(l);          // skip the ink when measuring
    }
    tones.sort((a, b) => a - b);
    const median = tones.length ? tones[Math.floor(tones.length / 2)] : 255;
    const lift = CLOTH / Math.max(1, median);

    const data = Buffer.alloc(w * h * 4);
    const outside = distanceOutside(set, w, h);
    const outer = outerRegion(set, w, h);
    const tube = TUBE ? tubeShading(set, w, h) : null;
    for (let p = 0; p < w * h; p++) {
        const i = p * 4;
        if (set[p]) {
            const l = body.data[i] * 0.3 + body.data[i + 1] * 0.59 + body.data[i + 2] * 0.11;
            const shaded = l * (tube ? tube[p] : 1);
            const v = l <= 60 ? 26 : Math.max(0, Math.min(255, Math.round(shaded * lift)));
            data[i] = data[i + 1] = data[i + 2] = v;
            data[i + 3] = 255;
        } else {
            const weight = outer[p] ? OUTLINE : HOLE_OUTLINE;
            if (outside[p] > weight) continue;
            const a = Math.max(0, Math.min(1, weight + 0.5 - outside[p]));
            data[i] = data[i + 1] = data[i + 2] = 26;
            data[i + 3] = Math.round(255 * a);
        }
    }
    return { image: { width: w, height: h, data }, crotch: { narrowed: 0, limit: 0 }, median: Math.round(median), lift: +lift.toFixed(2) };
}

// Her mask used as the texture itself: the tones she painted are the cloth, and
// the only thing added is the outline - full weight outside, thin around a hole.
// Her idea: start from WDI's own panties for the top of the garment, and carry
// the cloth down her shape to make the legs. The waistband, the groin arcs and
// the tone of the cloth then come from his art at the right resolution, and
// only what he never drew - the legs - is derived.
//
// His panties sit lower than her waistline (y 344 against 321 on the female
// body, face on), so the art is shifted to put his waistband on her waist.
// Below his hem, each column continues with the tone he left there, shaded as a
// cylinder so the legs read as tubes.
function fromPanties(mask, panties) {
    const { width: w, height: h } = mask;
    const set = maskSet(mask);
    const tube = TUBE ? tubeShading(set, w, h) : null;

    const box = set => {
        let top = h, bottom = -1, left = w, right = -1;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            if (!set[y * w + x]) continue;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
            if (x < left) left = x;
            if (x > right) right = x;
        }
        return { top, bottom, left, right };
    };
    const cloth = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) cloth[p] = panties.data[p * 4 + 3] >= 32 ? 1 : 0;
    const his = box(cloth), hers = box(set);

    // His panties stay exactly where he drew them - they sit on the body
    // correctly, and his waistband line then IS the garment's waistband. It is
    // her waistline that comes down to meet it: every row of her mask above his
    // top edge is dropped.
    const shift = 0;
    let lowered = 0;
    for (let y = hers.top; y < his.top; y++) {
        for (let x = 0; x < w; x++) if (set[y * w + x]) { set[y * w + x] = 0; lowered++; }
    }

    // The tone at the bottom of his cloth, per column: what the legs continue with.
    const hem = new Int16Array(w).fill(-1);
    for (let x = 0; x < w; x++) {
        for (let y = his.bottom; y >= his.top; y--) {
            if (!cloth[y * w + x]) continue;
            const i = (y * w + x) * 4;
            hem[x] = Math.round(panties.data[i] * 0.3 + panties.data[i + 1] * 0.59 + panties.data[i + 2] * 0.11);
            break;
        }
    }
    let fallback = 253;
    for (const v of hem) if (v > 60) { fallback = v; break; }

    const data = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const p = y * w + x;
            if (!set[p]) continue;
            const sx = Math.min(his.right, Math.max(his.left, x));
            const sy = y - shift;
            let tone;
            if (sy >= 0 && sy < h && cloth[sy * w + sx]) {
                // His art is left where he put it, ink included: that ink is
                // his waistband and his leg opening, and both are now in the
                // right place on the body.
                const s = (sy * w + sx) * 4;
                tone = panties.data[s] * 0.3 + panties.data[s + 1] * 0.59 + panties.data[s + 2] * 0.11;
            } else {
                tone = hem[sx] > 60 ? hem[sx] : fallback;
                if (tube) tone *= tube[p];
            }
            const i = p * 4;
            const v = tone <= 60 ? INK : Math.max(0, Math.min(255, Math.round(tone)));
            data[i] = data[i + 1] = data[i + 2] = v;
            data[i + 3] = 255;
        }
    }
    // His hem arc - the bottom edge of his panties - now falls inside our
    // garment, in the middle of the thigh. Three ways to treat it, because it is
    // a matter of taste rather than of correctness.
    const hisMiddle = (his.top + his.bottom) / 2;
    const marked = [];
    for (let p = 0; p < w * h; p++) {
        const y = (p - (p % w)) / w;
        if (set[p] && y > hisMiddle && data[p * 4 + 3] > 0 && data[p * 4] <= 60) marked.push(p);
    }
    if (PANTIES_HEM === 'seam') {
        for (const p of marked) {
            const i = p * 4;
            data[i] = data[i + 1] = data[i + 2] = PANTIES_SEAM_TONE;
        }
    } else if (PANTIES_HEM === 'erase') {
        // Diffusion: the line's pixels are averaged from their neighbours, over
        // and over, so the cloth closes without the comb pattern that guessing
        // column by column produced.
        const tone = new Float32Array(w * h);
        for (let p = 0; p < w * h; p++) tone[p] = data[p * 4];
        for (let pass = 0; pass < PANTIES_PASSES; pass++) {
            const next = Float32Array.from(tone);
            for (const p of marked) {
                let sum = 0, n = 0;
                for (const q of [p - 1, p + 1, p - w, p + w]) {
                    if (q < 0 || q >= w * h || !set[q]) continue;
                    sum += tone[q]; n++;
                }
                if (n) next[p] = sum / n;
            }
            tone.set(next);
        }
        for (const p of marked) {
            const i = p * 4;
            const v = Math.max(0, Math.min(255, Math.round(tone[p])));
            data[i] = data[i + 1] = data[i + 2] = v;
        }
    }

    const built = asPainted({ width: w, height: h, data });
    built.from = `panties kept in place, her waistline lowered by ${lowered} pixels`
        + `, hem ${PANTIES_HEM} (${marked.length} px)`;
    return built;
}

// Any 512 garment texture, clipped to her mask: the source keeps its waistband,
// its fly and its button, her mask decides the silhouette, and our outline is
// retraced around the result. Kas's VisiblePants pack is drawn for the vanilla
// legless body - 193 px wide against WDI's 175 - so clipping is exactly what
// makes it fit.
function fromSource(mask, source) {
    const { width: w, height: h } = mask;
    const set = maskSet(mask);
    const data = Buffer.alloc(w * h * 4);
    const tones = [];
    for (let p = 0; p < w * h; p++) {
        if (!set[p] || source.data[p * 4 + 3] < 32) continue;
        const i = p * 4;
        const l = source.data[i] * 0.3 + source.data[i + 1] * 0.59 + source.data[i + 2] * 0.11;
        data[i] = data[i + 1] = data[i + 2] = l <= 60 ? INK : Math.round(l);
        data[i + 3] = 255;
        if (l > 60) tones.push(l);
    }
    // Where her mask reaches past the source, the cloth continues with the
    // source's own median tone rather than a hole.
    tones.sort((a, b) => a - b);
    const median = tones.length ? Math.round(tones[Math.floor(tones.length / 2)]) : CLOTH;
    const tube = TUBE ? tubeShading(set, w, h) : null;
    let filled = 0;
    for (let p = 0; p < w * h; p++) {
        if (!set[p] || data[p * 4 + 3]) continue;
        const i = p * 4;
        const v = Math.round(median * (tube ? tube[p] : 1));
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
        filled++;
    }
    const built = asPainted({ width: w, height: h, data });
    built.from = 'source clipped to the mask, median ' + median + ', ' + filled + ' px continued';
    return built;
}

function asPainted(paint) {
    const { width: w, height: h } = paint;

    // Rendered at SUPER times the size and averaged back down. Thresholding the
    // alpha and stepping the outline by whole pixels left the edges jagged; a
    // single pass at 2x costs four times the pixels and removes the staircase
    // from her shape and from the outline at once.
    const s = Math.max(1, Math.round(SUPER));
    const bw = w * s, bh = h * s;
    const big = { width: bw, height: bh, data: Buffer.alloc(bw * bh * 4) };
    for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
            const from = (Math.floor(y / s) * w + Math.floor(x / s)) * 4;
            const to = (y * bw + x) * 4;
            for (let k = 0; k < 4; k++) big.data[to + k] = paint.data[from + k];
        }
    }

    // Her contour follows the pixel, WDI's follows a curve, and that is what
    // reads as jaggedness - not the alpha, which has one intermediate step on
    // both sides. So the shape itself is smoothed: the alpha is blurred over a
    // small radius and re-thresholded at half, which rounds a one-pixel jag off
    // a diagonal while leaving a deliberate corner alone.
    const set = smoothShape(maskSet(big), bw, bh, Math.round(SMOOTH * s));
    const outside = distanceOutside(set, bw, bh);
    const outer = outerRegion(set, bw, bh);
    const composed = Buffer.alloc(bw * bh * 4);
    for (let p = 0; p < bw * bh; p++) {
        const i = p * 4;
        if (set[p]) {
            for (let k = 0; k < 3; k++) composed[i + k] = big.data[i + k];
            composed[i + 3] = 255;
        } else {
            const weight = (outer[p] ? OUTLINE : HOLE_OUTLINE) * s;
            if (outside[p] > weight) continue;
            composed[i] = composed[i + 1] = composed[i + 2] = INK;
            composed[i + 3] = 255;
        }
    }

    // Box filter back to size, averaging colour weighted by alpha so the edge
    // fades instead of stepping.
    const data = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let r = 0, g = 0, b = 0, a = 0, n = 0;
            for (let dy = 0; dy < s; dy++) {
                for (let dx = 0; dx < s; dx++) {
                    const q = ((y * s + dy) * bw + x * s + dx) * 4;
                    const alpha = composed[q + 3] / 255;
                    r += composed[q] * alpha; g += composed[q + 1] * alpha; b += composed[q + 2] * alpha;
                    a += alpha; n++;
                }
            }
            const i = (y * w + x) * 4;
            if (a <= 0) continue;
            data[i] = Math.round(r / a);
            data[i + 1] = Math.round(g / a);
            data[i + 2] = Math.round(b / a);
            data[i + 3] = Math.round(255 * a / n);
        }
    }
    return { image: { width: w, height: h, data }, crotch: { narrowed: 0, limit: 0 } };
}

function build(mask, painted) {
    painted = painted ? medianFilter(painted, SHADE_MEDIAN) : null;
    const { width: w, height: h } = mask;
    const set = maskSet(mask);
    const crotch = narrowCrotch(set, w, h, 2 * OUTLINE);
    const zones = ZONES ? drawZones(set, w, h) : null;
    const inside = distanceInside(set, w, h);
    const outside = distanceOutside(set, w, h);
    const { top, bottom } = verticalRange(set, w, h);
    let centreX = 0, seen = 0;
    for (let y = top; y <= bottom; y++) for (let x = 0; x < w; x++) if (set[y * w + x]) { centreX += x; seen++; }
    centreX = seen ? Math.round(centreX / seen) : Math.round(w / 2);
    const span = Math.max(1, bottom - top);

    const data = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const p = y * w + x;
            const i = p * 4;
            if (set[p]) {
                // Cloth: darker towards every edge, lighter at the waist, with a
                // waistband picked out along the top.
                const edge = Math.min(1, inside[p] / EDGE_SHADE);
                const down = (y - top) / span;
                let tone = CLOTH * (1 - EDGE_DEPTH * (1 - edge) * (1 - edge));
                tone *= 1 + TOP_LIGHT * (1 - down) - 0.06 * down;
                // The waistband, as WDI draws it on its own underwear: a strip
                // slightly LIGHTER than the cloth, closed underneath by one
                // faint grey line. Darkening it, which is what this did first,
                // is not how that art reads.
                const fromTop = y - top;
                if (fromTop <= WAISTBAND) tone *= 1.04;
                else if (fromTop <= WAISTBAND + SEAM) tone *= 0.90;
                // Shading painted into the mask, if there was any: it multiplies
                // the computed one rather than replacing it, so a hand-darkened
                // fold sits on top of the edge shading instead of fighting it.
                if (painted) {
                    const factor = painted.data[i] / 128;   // 128 is neutral
                    tone *= 1 + SHADE_STRENGTH * (factor - 1);
                }
                if (zones) {
                    const factor = zones.data[i] / 128;
                    tone *= factor || 1;
                }
                const v = Math.max(0, Math.min(255, Math.round(quantise(tone, LEVELS))));
                data[i] = data[i + 1] = data[i + 2] = v;
                data[i + 3] = 255;
            } else if (outside[p] <= OUTLINE) {
                // The outline, softened over the last pixel so it does not stair-step.
                const a = Math.max(0, Math.min(1, OUTLINE + 0.5 - outside[p]));
                data[i] = data[i + 1] = data[i + 2] = 26;
                data[i + 3] = Math.round(255 * a);
            }
        }
    }
    // The crotch is not a seam, it is a separation, so it is drawn in ink and
    // not in grey - the same wedge WDI inks between the thighs on the naked
    // body, measured there: 5 px wide where it starts, 12 px at the hem.
    if (ZONES && CROTCH_INK) {
        const from = bottom - Math.round((bottom - top) * CROTCH_HEIGHT);
        for (let y = from; y <= bottom; y++) {
            const t = (y - from) / Math.max(1, bottom - from);
            const half = (CROTCH_TOP_WIDTH + (CROTCH_HEM_WIDTH - CROTCH_TOP_WIDTH) * t) / 2;
            for (let x = Math.round(centreX - half); x <= Math.round(centreX + half); x++) {
                const p = y * w + x;
                if (x < 0 || x >= w || !set[p]) continue;
                const i = p * 4;
                data[i] = data[i + 1] = data[i + 2] = 26;
                data[i + 3] = 255;
            }
        }
    }

    return { image: { width: w, height: h, data }, crotch };
}

function over(base, top, tint) {
    const out = Buffer.from(base.data);
    for (let i = 0; i < out.length; i += 4) {
        const a = top.data[i + 3] / 255;
        if (a <= 0) continue;
        for (let k = 0; k < 3; k++) {
            const c = tint ? top.data[i + k] * tint[k] / 255 : top.data[i + k];
            out[i + k] = Math.round(c * a + out[i + k] * (1 - a));
        }
        out[i + 3] = Math.max(out[i + 3], top.data[i + 3]);
    }
    return { width: base.width, height: base.height, data: out };
}

function onBackground(img, rgb) {
    const out = Buffer.alloc(img.data.length);
    for (let i = 0; i < out.length; i += 4) {
        const a = img.data[i + 3] / 255;
        for (let k = 0; k < 3; k++) out[i + k] = Math.round(img.data[i + k] * a + rgb[k] * (1 - a));
        out[i + 3] = 255;
    }
    return { width: img.width, height: img.height, data: out };
}

function sideBySide(images, gap) {
    const h = Math.max(...images.map(i => i.height));
    const w = images.reduce((s, i) => s + i.width, 0) + gap * (images.length - 1);
    const out = Buffer.alloc(w * h * 4);
    let x0 = 0;
    for (const img of images) {
        for (let y = 0; y < img.height; y++) {
            img.data.copy(out, (y * w + x0) * 4, y * img.width * 4, (y + 1) * img.width * 4);
        }
        x0 += img.width + gap;
    }
    return { width: w, height: h, data: out };
}

// One entry per texture the game may ask for, which is more than one per body
// type: with FemaleBodyVariants installed, a female pawn of a shared body type
// is drawn from a `_Female` texture, and the apparel has to follow.
//
// `source` is the body art the garment is fitted to, `sourceName` the garment
// art it is cut from. They come apart where the source has no such variant:
// the interpretation only takes the cloth and its markings from the source,
// and reads every dimension off the body, so a near neighbour does no harm.
function targets(bodies) {
    const drawn = new Set(['Female', 'Male', 'Thin', 'Fat', 'Fat_Female', 'Hulk']);
    const nearest = name => drawn.has(name) ? name
        : drawn.has(name.replace('_Female', '')) ? name.replace('_Female', '')
        : 'Thin';   // the child, and anything else nobody drew

    const list = [];
    for (const body of bodies) {
        list.push({ name: body.name, source: body.source, sourceName: nearest(body.name) });
        if (body.variant) {
            const name = body.name + '_Female';
            list.push({ name, source: body.variant, sourceName: nearest(name) });
        }
    }
    return list;
}

function main() {
    const all = process.argv.includes('--all');
    const only = [];
    for (let i = 0; i < process.argv.length; i++) if (process.argv[i] === '--body') only.push(process.argv[i + 1]);
    const bodies = BODIES.filter(b => all || only.length === 0 || only.includes(b.name));
    const preview = process.argv.includes('--preview');
    const CLOTH_TINT = [150, 196, 208];
    const bg = [40, 42, 46];

    for (const body of targets(bodies)) {
        for (const dir of DIRS) {
            const maskFile = path.join(MASKS, body.name, `Pants_mask_${dir}.png`);
            // Only the mask routes need one. The interpretation reads the body
            // and a source garment, and neither is a mask.
            if (!AUTO && !fs.existsSync(maskFile)) continue;
            const shadeFile = path.join(MASKS, body.name, 'Pants_shade_' + dir + '.png');
            const painted = fs.existsSync(shadeFile) ? decode(shadeFile) : null;
            const bodyFile = `${BODY_ART}/${body.source}_${dir}.png`;
            const paintFile = path.join(MASKS, body.name, 'Pants_paint_' + dir + '.png');
            const pantiesFile = PANTIES + '/panties_' + (body.variant ? body.variant.replace('Naked_', '') : body.name) + '_' + dir + '.png';
            const sourceFile = SOURCE ? SOURCE.replace('{body}', body.sourceName || body.name).replace('{dir}', dir) : null;
            const built = (AUTO && sourceFile && fs.existsSync(sourceFile) && fs.existsSync(bodyFile))
                ? interpret(decode(bodyFile), decode(sourceFile))
                : (sourceFile && fs.existsSync(sourceFile))
                ? fromSource(decode(maskFile), decode(sourceFile))
                : (FROM_PANTIES && fs.existsSync(pantiesFile))
                ? fromPanties(decode(maskFile), decode(pantiesFile))
                : (FROM_PAINT && fs.existsSync(paintFile))
                ? asPainted(decode(paintFile))
                : (FROM_BODY && fs.existsSync(bodyFile))
                ? fromBody(decode(maskFile), decode(bodyFile))
                : build(decode(maskFile), painted);
            const garment = built.image;
            fs.mkdirSync(OUT, { recursive: true });
            const target = path.join(OUT, `Pants_${body.name}_${dir}.png`);
            encode(target, garment);
            console.log(`${body.name} ${dir}: ${path.relative(path.join(__dirname, '..'), target)}`
                + (built.from ? ` (${built.from})` : built.median ? ` (cut from the body, tones lifted x${built.lift} from a median of ${built.median})` : ` (crotch narrowed to ${built.crotch.limit}px on ${built.crotch.narrowed} rows)`));

            if (preview) {
                const previewBody = bodyFile;
                if (!fs.existsSync(previewBody)) continue;
                const bodyImg = decode(bodyFile);
                encode(path.join(ART, `garment_${body.name}_${dir}.png`), sideBySide([
                    onBackground(garment, bg),
                    onBackground(over(bodyImg, garment, CLOTH_TINT), bg),
                    onBackground(bodyImg, bg),
                ], 8));
            }
        }
    }
}

main();

// A box blur of the mask's alpha, re-thresholded: the cheap way to round a
// hand-drawn contour without moving it. Two passes, horizontal then vertical.
function smoothShape(set, w, h, radius) {
    if (radius <= 0) return set;
    const acc = new Float32Array(w * h);
    const tmp = new Float32Array(w * h);
    const span = radius * 2 + 1;
    for (let y = 0; y < h; y++) {
        let sum = 0;
        for (let x = -radius; x <= radius; x++) sum += set[y * w + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
            tmp[y * w + x] = sum / span;
            const drop = set[y * w + Math.min(w - 1, Math.max(0, x - radius))];
            const add = set[y * w + Math.min(w - 1, Math.max(0, x + radius + 1))];
            sum += add - drop;
        }
    }
    for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
            acc[y * w + x] = sum / span;
            const drop = tmp[Math.min(h - 1, Math.max(0, y - radius)) * w + x];
            const add = tmp[Math.min(h - 1, Math.max(0, y + radius + 1)) * w + x];
            sum += add - drop;
        }
    }
    const out = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) out[p] = acc[p] >= 0.5 ? 1 : 0;
    return out;
}

// The interpretation, with no hand-painted mask at all - what THIGAPPE and
// TailorMade do, done here at build time instead of at render time.
//
// The source garment was drawn for the vanilla legless body; WDI's body is
// narrower and shorter. So, row by row inside the band the garment occupies,
// the source's run of cloth is mapped onto the body's run: a per-row warp, the
// same trick TailorMade uses, which keeps a waistband horizontal and a fly
// centred while the silhouette changes. The body is eroded first, by the weight
// of its own outline, so the garment stops inside the drawn line.
function interpret(bodyImg, source) {
    const { width: w, height: h } = bodyImg;

    const solid = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) solid[p] = bodyImg.data[p * 4 + 3] >= 32 ? 1 : 0;
    const body = erodeSet(solid, w, h, AUTO_INSET);

    const cloth = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) cloth[p] = source.data[p * 4 + 3] >= 32 ? 1 : 0;

    const runs = (set, y) => {
        let left = -1, right = -1;
        for (let x = 0; x < w; x++) if (set[y * w + x]) { if (left < 0) left = x; right = x; }
        return left < 0 ? null : { left, right };
    };

    const sourceBox = { top: h, bottom: -1 };
    for (let y = 0; y < h; y++) if (runs(cloth, y)) { if (y < sourceBox.top) sourceBox.top = y; sourceBox.bottom = y; }
    const bodyBox = { top: h, bottom: -1 };
    for (let y = 0; y < h; y++) if (runs(body, y)) { if (y < bodyBox.top) bodyBox.top = y; bodyBox.bottom = y; }

    // The garment covers the same share of the body's height as it did of the
    // vanilla one, hems aligned on the bottom.
    const bodyHeight = bodyBox.bottom - bodyBox.top + 1;
    const top = Math.max(bodyBox.top, bodyBox.bottom - Math.round(bodyHeight * AUTO_HEIGHT));

    const data = Buffer.alloc(w * h * 4);
    const tones = [];
    for (let y = top; y <= bodyBox.bottom; y++) {
        const target = runs(body, y);
        if (!target) continue;
        const t = (y - top) / Math.max(1, bodyBox.bottom - top);
        const sy = Math.round(sourceBox.top + t * (sourceBox.bottom - sourceBox.top));
        const from = runs(cloth, sy);
        if (!from) continue;
        for (let x = target.left; x <= target.right; x++) {
            if (!body[y * w + x]) continue;
            const u = (x - target.left) / Math.max(1, target.right - target.left);
            const sx = Math.round(from.left + u * (from.right - from.left));
            const s = (sy * w + sx) * 4;
            if (source.data[s + 3] < 32) continue;
            const l = source.data[s] * 0.3 + source.data[s + 1] * 0.59 + source.data[s + 2] * 0.11;
            const i = (y * w + x) * 4;
            data[i] = data[i + 1] = data[i + 2] = l <= 60 ? INK : Math.round(l);
            data[i + 3] = 255;
            if (l > 60) tones.push(l);
        }
    }

    const built = asPainted({ width: w, height: h, data });
    tones.sort((a, b) => a - b);
    built.from = `interpreted onto the body, rows ${top}..${bodyBox.bottom}, median `
        + (tones.length ? tones[Math.floor(tones.length / 2)] : 0);
    return built;
}

// Erosion, as in from-xcf: the garment stops inside the body's drawn outline.
function erodeSet(set, w, h, radius) {
    if (radius <= 0) return set;
    const out = new Uint8Array(w * h);
    const r2 = radius * radius;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!set[y * w + x]) continue;
            let inside = true;
            for (let dy = -radius; dy <= radius && inside; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) { inside = false; break; }
                for (let dx = -radius; dx <= radius; dx++) {
                    if (dx * dx + dy * dy > r2) continue;
                    const nx = x + dx;
                    if (nx < 0 || nx >= w || !set[ny * w + nx]) { inside = false; break; }
                }
            }
            if (inside) out[y * w + x] = 1;
        }
    }
    return out;
}
