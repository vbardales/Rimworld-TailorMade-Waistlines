'use strict';
// Builds TailorMade pants masks from a body texture mod's naked silhouettes.
//
// A pants mask tells TailorMade where a leg garment may show: the body from the
// waist down, stopping just inside the drawn outline, with the crotch line cut
// out so the garment reads as trousers instead of a skirt. Every edge comes from
// the body art itself, never from a shape invented here. Only the alpha channel
// is read by TailorMade, so the masks are white on transparent.
//
//   node make-masks.js [--body Female] [--all] [--out DIR]
//
// Tunables have --flags, listed with the constants below.
//
// Without --all only the body types listed in BODIES are rebuilt.

const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const SOURCE = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const num = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? parseFloat(process.argv[i + 1]) : fallback; };
const strArg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : fallback; };
const OUT = strArg('out', path.join(__dirname, '..', 'Mod', 'Textures', 'Things', 'TailoredPants'));

const BODIES = require('./bodies');

const DIRS = ['south', 'north', 'east'];   // west is mirrored from east by TailorMade

const ALPHA_IN = 32;          // a body pixel counts as solid above this alpha
const WAIST_FROM = num('waist-from', 0.46);  // the waistline is the narrowest row between
const WAIST_TO = num('waist-to', 0.56);      // these two fractions of the body height, from the top
const INK_LUMA = num('ink', 100);        // below this luminance a pixel is line art, not skin
const EDGE_INSET = num('inset', 6);       // how far inside the drawn outline the mask stops
const WEDGE_REACH = num('wedge-reach', 0.07); // the crotch is looked for this far from the centre, in hip widths
const HEM_TOUCH = num('hem-touch', 8);   // a crotch line must come this close to the hem
const CREASE_FROM = num('crease-from', 0.35);  // the drawn waist crease is looked for between
const CREASE_TO = num('crease-to', 0.62);      // these two fractions of the body height
const CREASE_MIN = num('crease-min', 2);       // and must be at least this many pixels thick
const CREASE_SPREAD = num('crease-spread', 12); // how far from the line's median a column may sit
const CREASE_SMOOTH = num('crease-smooth', 41); // running median window across the columns
const WAIST_MODE = strArg('waist-mode', 'row'); // 'row' cuts flat at the waist, 'crease' follows the drawn line - which grew horns on the hips, so it is opt-in

function rowSpans(img) {
    const { width: w, height: h, data } = img;
    const spans = [];
    for (let y = 0; y < h; y++) {
        let left = -1, right = -1;
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] >= ALPHA_IN) {
                if (left < 0) left = x;
                right = x;
            }
        }
        spans.push(left < 0 ? null : { left, right, width: right - left + 1 });
    }
    return spans;
}

function bounds(spans) {
    let top = -1, bottom = -1;
    for (let y = 0; y < spans.length; y++) {
        if (spans[y]) {
            if (top < 0) top = y;
            bottom = y;
        }
    }
    return { top, bottom, height: bottom - top + 1 };
}

// The waistline: the narrowest row in the window where a waist can be. On a
// body with no pinch at all this simply lands at the bottom of the window,
// which is still where a belt would sit.
function waistRow(spans, box) {
    const from = box.top + Math.round(WAIST_FROM * box.height);
    const to = box.top + Math.round(WAIST_TO * box.height);
    let best = from, bestWidth = Infinity;
    for (let y = from; y <= to; y++) {
        if (spans[y] && spans[y].width <= bestWidth) {
            bestWidth = spans[y].width;
            best = y;
        }
    }
    return best;
}

function widest(spans, from, to) {
    let w = 0;
    for (let y = from; y <= to; y++) if (spans[y] && spans[y].width > w) w = spans[y].width;
    return w;
}

const luma = (data, i) => data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;

// The body art is skin with black line work drawn into it: the outline ring
// around the silhouette, the wedge between the thighs, the crease under the
// buttocks, the navel. Keeping the skin and dropping the ink gives a mask whose
// edges are the lines the artist drew — the crotch and the bottom of each leg
// included — instead of a shape we invented.
function skinAndInk(img) {
    const { width: w, height: h, data } = img;
    const skin = new Uint8Array(w * h);
    const ink = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) {
        const i = p * 4;
        if (data[i + 3] < ALPHA_IN) continue;
        if (luma(data, i) < INK_LUMA) ink[p] = 1; else skin[p] = 1;
    }
    return { skin, ink };
}

// Pixels of the body that lie at least `radius` inside its edge. The outline
// ring the artist drew is that thick, so eroding by it puts the mask's border on
// the inner side of the line: the garment stops against the outline instead of
// painting over it.
function erode(solid, w, h, radius) {
    const out = new Uint8Array(w * h);
    const r2 = radius * radius;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!solid[y * w + x]) continue;
            let inside = true;
            for (let dy = -radius; dy <= radius && inside; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) { inside = false; break; }
                for (let dx = -radius; dx <= radius; dx++) {
                    if (dx * dx + dy * dy > r2) continue;
                    const nx = x + dx;
                    if (nx < 0 || nx >= w || !solid[ny * w + nx]) { inside = false; break; }
                }
            }
            if (inside) out[y * w + x] = 1;
        }
    }
    return out;
}

function dilate(set, w, h, radius) {
    const out = new Uint8Array(w * h);
    const r2 = radius * radius;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!set[y * w + x]) continue;
            for (let dy = -radius; dy <= radius; dy++) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) continue;
                for (let dx = -radius; dx <= radius; dx++) {
                    if (dx * dx + dy * dy > r2) continue;
                    const nx = x + dx;
                    if (nx < 0 || nx >= w) continue;
                    out[ny * w + nx] = 1;
                }
            }
        }
    }
    return out;
}

// Ink that the skin encloses — a navel, a crease inside a thigh — would punch a
// hole through the garment, so it is given back to the mask. Ink that reaches
// the outside of the body is the outline and the crotch wedge, and it stays cut.
function fillEnclosedInk(ink, skin, w, h) {
    const open = new Uint8Array(w * h);
    const stack = [];
    const push = p => { if (!open[p] && !skin[p]) { open[p] = 1; stack.push(p); } };
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
    const kept = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) kept[p] = ink[p] && !open[p] ? 1 : 0;
    return kept;
}

// Where the body is drawn as one legless shape, the only line that has to cut
// through the garment is the wedge between the thighs. Every other crease the
// artist drew — belly folds, hip lines, the crease under the buttocks — is
// shading the garment should simply cover, which is why the ink is not cut
// wholesale: doing that ate half the hips on Hulk and half the belly on Fat.
// Only the ink that runs down to the hem counts as the crotch: on the hulk body
// the same central area also carries drawn hair, and cutting that punched holes
// through the garment. So the ink below the waist is split into blobs, and a blob
// is kept only if it reaches the bottom of the body.
function crotchWedge(img, ink, skin, box, waist, hip) {
    const { width: w, height: h } = img;
    // Hair and creases the skin encloses are shading, not a silhouette edge, so
    // they must not cut: only ink open to the outside of the body can.
    const enclosed = fillEnclosedInk(ink, skin, w, h);
    ink = ink.map((v, p) => (v && !enclosed[p] ? 1 : 0));
    const center = Math.round((box.left + box.right) / 2);
    const reach = Math.round(WEDGE_REACH * hip);
    const from = Math.max(0, center - reach), to = Math.min(w - 1, center + reach);

    const seen = new Uint8Array(w * h);
    const wedge = new Uint8Array(w * h);
    const candidates = [];
    for (let y = waist; y <= box.bottom; y++) {
        for (let x = from; x <= to; x++) {
            const start = y * w + x;
            if (!ink[start] || seen[start]) continue;
            const blob = [];
            const stack = [start];
            seen[start] = 1;
            let touchesHem = false;
            while (stack.length) {
                const p = stack.pop();
                blob.push(p);
                const px = p % w, py = (p - px) / w;
                if (py >= box.bottom - HEM_TOUCH) touchesHem = true;
                const push = q => {
                    const qx = q % w, qy = (q - qx) / w;
                    if (qy < waist || qy > box.bottom || qx < from || qx > to) return;
                    if (ink[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
                };
                if (px > 0) push(p - 1);
                if (px < w - 1) push(p + 1);
                if (py > 0) push(p - w);
                if (py < h - 1) push(p + w);
            }
            if (touchesHem) candidates.push(blob);
        }
    }

    // One body, one crotch: of the lines that run down to the hem, keep the one
    // that ends closest to the middle. The others are hair or a fold that only
    // happens to touch, and cutting them left specks of skin on the garment.
    let best = null, bestLowest = -1, bestOffset = Infinity;
    for (const blob of candidates) {
        let lowest = -1, lowestX = 0;
        for (const p of blob) {
            const px = p % w, py = (p - px) / w;
            if (py > lowest) { lowest = py; lowestX = px; }
        }
        const offset = Math.abs(lowestX - center);
        // The crotch is the line that goes deepest; drawn hair stops higher up.
        if (lowest > bestLowest || (lowest === bestLowest && offset < bestOffset)) {
            bestLowest = lowest; bestOffset = offset; best = blob;
        }
    }
    if (best) for (const p of best) wedge[p] = 1;
    return wedge;
}

// The waistline the artist already drew: WDI inks the lower-belly crease across
// the hips, in pure black, and it steps at the middle where the navel line
// crosses it. Followed column by column, the mask gets that crease and its step
// instead of a flat cut or a circle drawn by hand. Columns where the crease is
// interrupted keep their neighbour's row, which is what reproduces the step.
function creaseLine(img, skin, ink, box, fallbackRow) {
    const { width: w } = img;
    const from = box.top + Math.round(CREASE_FROM * box.height);
    const to = box.top + Math.round(CREASE_TO * box.height);
    const open = fillEnclosedInk(ink, skin, w, img.height);

    const line = new Int32Array(w).fill(-1);
    for (let x = 0; x < w; x++) {
        for (let y = from; y <= to; y++) {
            const p = y * w + x;
            if (!ink[p] || open[p]) continue;      // the outline is open ink, the crease is enclosed
            let end = y;
            while (end + 1 <= to && ink[(end + 1) * w + x] && !open[(end + 1) * w + x]) end++;
            if (end - y + 1 < CREASE_MIN) continue;   // a speck, not a line
            line[x] = end + 1;
            break;
        }
    }

    // Keep only what sits on one horizontal line. Along the flanks the shading
    // dips under the ink threshold as well, and taking it drew two straps up
    // the sides; the crease itself is level, so the median row is the anchor.
    const rows = [...line].filter(v => v >= 0).sort((a, b) => a - b);
    if (rows.length >= 8) {
        const median = rows[Math.floor(rows.length / 2)];
        for (let x = 0; x < w; x++) {
            if (line[x] >= 0 && Math.abs(line[x] - median) > CREASE_SPREAD) line[x] = -1;
        }
    }

    // Fill the gaps sideways, then fall back to the flat waist row where the
    // crease was never found at all.
    let found = 0;
    for (const v of line) if (v >= 0) found++;
    if (found < w * 0.05) return null;
    let last = -1;
    for (let x = 0; x < w; x++) { if (line[x] >= 0) last = line[x]; else if (last >= 0) line[x] = last; }
    last = -1;
    for (let x = w - 1; x >= 0; x--) { if (line[x] >= 0) last = line[x]; else if (last >= 0) line[x] = last; }
    for (let x = 0; x < w; x++) if (line[x] < 0) line[x] = fallbackRow;

    // A running median over the columns. Without it the shading at the hips
    // leaves two little ears standing above the waistline; the step at the
    // middle is wide enough to survive the window.
    const smoothed = new Int32Array(w);
    const half = Math.floor(CREASE_SMOOTH / 2);
    for (let x = 0; x < w; x++) {
        const window = [];
        for (let k = -half; k <= half; k++) {
            const q = x + k;
            if (q >= 0 && q < w) window.push(line[q]);
        }
        window.sort((a, b) => a - b);
        smoothed[x] = window[Math.floor(window.length / 2)];
    }
    return smoothed;
}

function buildMask(img, others) {
    const { width: w, height: h } = img;
    const spans = rowSpans(img);
    const box = bounds(spans);
    const waist = waistRow(spans, box);
    const hip = widest(spans, waist, box.bottom);
    box.left = Math.min(...spans.filter(Boolean).map(s => s.left));
    box.right = Math.max(...spans.filter(Boolean).map(s => s.right));

    const shapes = [img, ...others].map(source => {
        const { skin, ink } = skinAndInk(source);
        const solid = new Uint8Array(w * h);
        for (let p = 0; p < w * h; p++) solid[p] = skin[p] || ink[p] ? 1 : 0;
        const body = erode(solid, w, h, EDGE_INSET);
        const wedge = dilate(crotchWedge(source, ink, skin, box, waist, hip), w, h, 1);
        return { body, wedge };
    });

    const { skin, ink } = skinAndInk(img);
    const crease = WAIST_MODE === 'crease' ? creaseLine(img, skin, ink, box, waist) : null;

    const out = Buffer.alloc(w * h * 4);
    const start = crease ? Math.min(...crease.filter(v => v > 0)) : waist;
    for (let y = start; y <= box.bottom; y++) {
        for (let x = 0; x < w; x++) {
            if (crease && y < crease[x]) continue;
            const p = y * w + x;
            // Keep what every silhouette sharing this mask covers, minus every
            // crotch wedge, so the mask never spills outside the narrower body.
            let keep = true;
            for (const shape of shapes) {
                if (!shape.body[p] || shape.wedge[p]) { keep = false; break; }
            }
            if (!keep) continue;
            const i = p * 4;
            out[i] = out[i + 1] = out[i + 2] = 255;
            out[i + 3] = 255;
        }
    }
    return { img: { width: w, height: h, data: out }, waist, box, hip };
}

// A mask painted over in GIMP must survive the next run of this script. Each
// generated file's hash is recorded; a file whose hash no longer matches was
// touched by hand and is left alone unless --overwrite says otherwise.
const LOCK = path.join(__dirname, 'masks.lock.json');
const lock = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, 'utf8')) : {};

function hash(file) {
    return require('crypto').createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

function handEdited(file) {
    if (!fs.existsSync(file)) return false;
    const key = path.relative(__dirname, file).replace(/\\/g, '/');
    return lock[key] !== undefined && lock[key] !== hash(file);
}

function remember(file) {
    const key = path.relative(__dirname, file).replace(/\\/g, '/');
    lock[key] = hash(file);
    fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
}

const waists = [];

function main() {
    const args = process.argv.slice(2);
    const all = args.includes('--all');
    const only = [];
    for (let i = 0; i < args.length; i++) if (args[i] === '--body') only.push(args[i + 1]);
    const bodies = BODIES.filter(b => all || only.length === 0 || only.includes(b.name));

    for (const body of bodies) {
        for (const dir of DIRS) {
            const file = `${SOURCE}/${body.source}_${dir}.png`;
            if (!fs.existsSync(file)) {
                console.log(`${body.name} ${dir}: no source texture, skipped`);
                continue;
            }
            const img = decode(file);
            const others = [];
            if (body.variant) {
                const variantFile = `${SOURCE}/${body.variant}_${dir}.png`;
                if (fs.existsSync(variantFile)) others.push(decode(variantFile));
            }
            const built = buildMask(img, others);
            const dest = path.join(OUT, body.name);
            fs.mkdirSync(dest, { recursive: true });
            const target = path.join(dest, `Pants_mask_${dir}.png`);
            if (handEdited(target) && !process.argv.includes('--overwrite')) {
                console.log(`${body.name} ${dir}: edited by hand since it was generated, left alone`);
                continue;
            }
            encode(target, built.img);
            remember(target);
            waists.push([body.name, dir, built.waist]);
            const rel = ((built.waist - built.box.top) / built.box.height).toFixed(2);
            console.log(`${body.name} ${dir}: waist y=${built.waist} (${rel} of height), hip ${built.hip}px`
                + (others.length ? ', trimmed to the female variant' : ''));
        }
    }
}

// The GIMP projects put a guide on the waistline, so the rows are written out
// in a form Script-Fu can load.
function writeWaists() {
    if (!waists.length) return;
    const rows = waists.map(([body, dir, row]) => `    ("${body}" "${dir}" ${row})`);
    const scm = [
        '; Generated by make-masks.js: the waistline row of each mask.',
        "(define tp-waists '(",     // quoted: Script-Fu must not evaluate the rows
        ...rows,
        '))',
        '',
    ].join('\n');
    fs.writeFileSync(path.join(__dirname, 'waists.scm'), scm);
}

main();
writeWaists();
