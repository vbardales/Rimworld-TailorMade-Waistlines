'use strict';
// Pulls a hand-painted mask out of a GIMP project and installs it in the mod,
// without going through GIMP's exporter.
//
//   node from-xcf.js --file femme1.xcf --body Female --facing south
//   node from-xcf.js --file femme1.xcf --body Female --facing south --layer MASK
//   node from-xcf.js --file femme1.xcf --body Female --facing south --dry-run
//
// The layer's alpha is what TailorMade reads, so the mask is written as white
// on transparent with a hard edge: anything the brush left more than half
// opaque counts as covered. `make-masks.js` then leaves the file alone, since
// its hash no longer matches what the generator wrote.

const fs = require('fs');
const path = require('path');
const { read } = require('./xcf');
const { encode } = require('./png');

const BODIES = require('./bodies');
const BODY_ART = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const MASKS = path.join(__dirname, '..', 'Mod', 'Textures', 'Things', 'TailoredPants');
const CUTOFF = 128;
const SHADE_RANGE = 12;   // tones must span this much before they count as shading
const INSET = 6;          // the mask stops this far inside the body, the weight of its outline

// A brush does not stop at the body's edge. Whatever falls outside the
// silhouette would put the garment, and the outline TailorMade traces around
// it, beyond the body - so it is clipped, and the count is reported.
// It is clipped to the body eroded by the weight of the drawn outline, not to
// the raw silhouette: the garment gets its own outline afterwards, and if the
// mask reached the outer edge of the body's black ring that new outline would
// land outside the body and fatten the pawn. Stopping on the inner side of the
// ring puts the two lines on top of each other instead.
function bodySilhouette(bodyName, facing, inset) {
    const body = BODIES.find(b => b.name === bodyName);
    if (!body) return null;
    const file = `${BODY_ART}/${body.source}_${facing}.png`;
    if (!fs.existsSync(file)) return null;
    const img = require('./png').decode(file);
    const { width: w, height: h } = img;
    const set = new Uint8Array(w * h);
    for (let p = 0; p < set.length; p++) set[p] = img.data[p * 4 + 3] >= 32 ? 1 : 0;
    if (inset <= 0) return set;

    const eroded = new Uint8Array(w * h);
    const r2 = inset * inset;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!set[y * w + x]) continue;
            let inside = true;
            for (let dy = -inset; dy <= inset && inside; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) { inside = false; break; }
                for (let dx = -inset; dx <= inset; dx++) {
                    if (dx * dx + dy * dy > r2) continue;
                    const nx = x + dx;
                    if (nx < 0 || nx >= w || !set[ny * w + nx]) { inside = false; break; }
                }
            }
            if (inside) eroded[y * w + x] = 1;
        }
    }
    return eroded;
}

const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : fallback;
};

function main() {
    const file = arg('file');
    const body = arg('body');
    const facing = arg('facing', 'south');
    const layerName = arg('layer', 'MASK');
    const dryRun = process.argv.includes('--dry-run');

    if (!file || !body) {
        console.error('usage: node from-xcf.js --file <project.xcf> --body <BodyType> [--facing south] [--layer MASK]');
        process.exit(2);
    }

    const project = read(path.isAbsolute(file) ? file : path.join(__dirname, file));
    // GIMP names a duplicated layer 'Copie de MASK #2', and that copy is often
    // the one being worked on while the original is hidden. So: the visible
    // layer whose name mentions the mask, else the one named exactly so.
    const named = l => l.name === layerName;
    const mentions = l => l.name.toUpperCase().includes(layerName.toUpperCase());
    const layer = project.layers.find(l => l.visible && mentions(l))
        || project.layers.find(named)
        || project.layers.find(mentions);
    if (!layer) {
        console.error(`no layer named ${layerName}; the project has: ${project.layers.map(l => l.name).join(', ')}`);
        process.exit(1);
    }

    const { width, height, data } = layer.image;
    const inset = process.argv.includes('--inset') ? parseInt(arg('inset'), 10) : INSET;
    const silhouette = process.argv.includes('--no-clip') ? null : bodySilhouette(body, facing, inset);
    const out = Buffer.alloc(width * height * 4);
    let covered = 0, clipped = 0;
    for (let p = 0; p < width * height; p++) {
        if (data[p * 4 + 3] < CUTOFF) continue;
        if (silhouette && !silhouette[p]) { clipped++; continue; }
        const i = p * 4;
        out[i] = out[i + 1] = out[i + 2] = 255;
        out[i + 3] = 255;
        covered++;
    }
    if (clipped) console.log(`${clipped} pixels reached past the body or into its outline, and were clipped back`);

    // Shading painted into the mask. Only the alpha decides where the garment
    // shows, so the tones are free for something else: light and shade.
    //
    // They are normalised on the MEDIAN tone, not the brightest one. Painting a
    // field of mid grey with a few bright highlight strokes - which is what a
    // hand does - has a maximum of pure white over a handful of pixels, and
    // normalising on that darkened the whole garment by a fifth. Against the
    // median, the field stays neutral, a lighter stroke lightens and a darker
    // one darkens. 128 is written for neutral, so the file carries a factor.
    let shade = null;
    const tones = [];
    for (let p = 0; p < width * height; p++) {
        if (data[p * 4 + 3] < CUTOFF) continue;
        if (silhouette && !silhouette[p]) continue;
        tones.push(data[p * 4] * 0.3 + data[p * 4 + 1] * 0.59 + data[p * 4 + 2] * 0.11);
    }
    if (tones.length) {
        const sorted = [...tones].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)] || 255;
        const low = sorted[Math.floor(sorted.length * 0.02)];
        const high = sorted[Math.floor(sorted.length * 0.98)];
        if (high - low > SHADE_RANGE) {
            shade = Buffer.alloc(width * height * 4);
            for (let p = 0; p < width * height; p++) {
                if (data[p * 4 + 3] < CUTOFF) continue;
                if (silhouette && !silhouette[p]) continue;
                const l = data[p * 4] * 0.3 + data[p * 4 + 1] * 0.59 + data[p * 4 + 2] * 0.11;
                const v = Math.max(0, Math.min(255, Math.round(128 * l / median)));
                const i = p * 4;
                shade[i] = shade[i + 1] = shade[i + 2] = v;
                shade[i + 3] = 255;
            }
            console.log(`tones ${Math.round(low)}..${Math.round(high)} around a median of ${Math.round(median)}: kept as shading`);
        }
    }

    const target = path.join(MASKS, body, `Pants_mask_${facing}.png`);
    console.log(`${path.basename(project.file)} / ${layerName}: ${covered} covered pixels of ${width}x${height}`);
    if (dryRun) {
        console.log(`would write ${target}`);
        return;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    encode(target, { width, height, data: out });
    console.log(`wrote ${target}`);

    // The layer exactly as painted, alpha and tones together, for the mode that
    // uses her mask as the texture itself instead of deriving one from it.
    const paintTarget = path.join(MASKS, body, `Pants_paint_${facing}.png`);
    const paint = Buffer.alloc(width * height * 4);
    for (let p = 0; p < width * height; p++) {
        if (data[p * 4 + 3] < CUTOFF) continue;
        if (silhouette && !silhouette[p]) continue;
        for (let k = 0; k < 4; k++) paint[p * 4 + k] = data[p * 4 + k];
        paint[p * 4 + 3] = 255;
    }
    encode(paintTarget, { width, height, data: paint });
    console.log(`wrote ${paintTarget}`);

    const shadeTarget = path.join(MASKS, body, `Pants_shade_${facing}.png`);
    if (shade) {
        encode(shadeTarget, { width, height, data: shade });
        console.log(`wrote ${shadeTarget}`);
    } else if (fs.existsSync(shadeTarget)) {
        fs.unlinkSync(shadeTarget);   // the mask is flat again, so drop stale shading
        console.log(`removed ${shadeTarget}`);
    }
}

main();
