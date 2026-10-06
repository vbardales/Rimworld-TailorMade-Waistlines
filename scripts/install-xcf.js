'use strict';
// Installs every hand-painted project at once: her shapes are the source of
// truth, the generator only ever provided a starting point.
//
//   node install-xcf.js                 # every .xcf beside this script
//   node install-xcf.js --dir ../Art/Gimp
//   node install-xcf.js --dry-run
//
// The body type and the facing are read from the project itself: its `body`
// layer is the very texture gimp-assets.js copied, so it is compared against
// every body texture until one matches. Nothing depends on the file's name.
// Where two projects claim the same body and facing, the newest wins.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { read } = require('./xcf');
const { decode } = require('./png');

const BODIES = require('./bodies');
const BODY_ART = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const DIRS = ['south', 'north', 'east'];

const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : fallback;
};

// Every body texture, kept as its alpha signature: opaque pixel count plus the
// bounding box. Cheap, and enough to tell six bodies and three facings apart.
function signatures() {
    const list = [];
    for (const body of BODIES) {
        for (const dir of DIRS) {
            for (const source of [body.source, body.variant].filter(Boolean)) {
                const file = `${BODY_ART}/${source}_${dir}.png`;
                if (!fs.existsSync(file)) continue;
                list.push({ body: body.name, dir, source, ...signature(decode(file)) });
            }
        }
    }
    return list;
}

function signature(img) {
    const { width: w, height: h, data } = img;
    let count = 0, left = w, right = -1, top = h, bottom = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] < 32) continue;
            count++;
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
        }
    }
    return { count, left, right, top, bottom };
}

function distance(a, b) {
    return Math.abs(a.count - b.count) / 500
        + Math.abs(a.left - b.left) + Math.abs(a.right - b.right)
        + Math.abs(a.top - b.top) + Math.abs(a.bottom - b.bottom);
}

function main() {
    const dir = path.resolve(__dirname, arg('dir', '.'));
    const dryRun = process.argv.includes('--dry-run');
    const projects = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.xcf'));
    if (!projects.length) {
        console.log(`no .xcf under ${dir}`);
        return;
    }

    const known = signatures();
    const chosen = new Map();
    for (const name of projects) {
        const file = path.join(dir, name);
        let project;
        try { project = read(file); }
        catch (e) { console.log(`${name}: unreadable (${e.message})`); continue; }

        const bodyLayer = project.layers.find(l => l.name === 'body');
        const maskLayer = project.layers.find(l => l.name === 'MASK');
        if (!bodyLayer || !maskLayer) {
            console.log(`${name}: needs a 'body' and a 'MASK' layer, has ${project.layers.map(l => l.name).join(', ')}`);
            continue;
        }

        const sig = signature(bodyLayer.image);
        let best = null, bestScore = Infinity;
        for (const candidate of known) {
            const score = distance(sig, candidate);
            if (score < bestScore) { bestScore = score; best = candidate; }
        }
        if (!best || bestScore > 40) {
            console.log(`${name}: no body texture matches its 'body' layer (closest ${best && best.body} ${best && best.dir}, score ${bestScore.toFixed(0)})`);
            continue;
        }

        const key = `${best.body}/${best.dir}`;
        const stamp = fs.statSync(file).mtimeMs;
        const previous = chosen.get(key);
        console.log(`${name}: ${best.body} ${best.dir} (from ${best.source}, score ${bestScore.toFixed(1)})`);
        if (!previous || stamp > previous.stamp) chosen.set(key, { file, name, stamp, ...best });
    }

    for (const [key, pick] of chosen) {
        console.log(`\n${key} <- ${pick.name}`);
        if (dryRun) continue;
        const out = execFileSync(process.execPath, [
            path.join(__dirname, 'from-xcf.js'),
            '--file', pick.file, '--body', pick.body, '--facing', pick.dir,
        ], { encoding: 'utf8' });
        process.stdout.write(out);
        const built = execFileSync(process.execPath, [
            path.join(__dirname, 'make-garment.js'), '--body', pick.body, '--preview',
        ], { encoding: 'utf8' });
        process.stdout.write(built.split('\n').filter(l => l.includes(pick.dir)).join('\n') + '\n');
    }
}

main();
