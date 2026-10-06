'use strict';
// Lays out, per body type and facing, the three images a GIMP project needs:
// the body to trace over, the mask as it stands, and the garment as TailorMade
// would render it through that mask.
//
//   node gimp-assets.js [--all]

const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const BODIES = require('./bodies');
const SOURCE = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const MASKS = path.join(__dirname, '..', 'Mod', 'Textures', 'Things', 'TailoredPants');
const ART = path.join(__dirname, '..', 'Art');
const OUT = path.join(ART, 'Gimp');
const DIRS = ['south', 'north', 'east'];
const PANEL = 512, GAP = 8, FITTED_PANEL = 2;

function cut(img, x0, y0, w, h) {
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
        img.data.copy(out, y * w * 4, ((y0 + y) * img.width + x0) * 4, ((y0 + y) * img.width + x0 + w) * 4);
    }
    return { width: w, height: h, data: out };
}

function main() {
    for (const body of BODIES) {
        for (const dir of DIRS) {
            const bodyFile = `${SOURCE}/${body.source}_${dir}.png`;
            if (!fs.existsSync(bodyFile)) continue;
            const dest = path.join(OUT, body.name);
            fs.mkdirSync(dest, { recursive: true });

            fs.copyFileSync(bodyFile, path.join(dest, `body_${dir}.png`));

            const maskFile = path.join(MASKS, body.name, `Pants_mask_${dir}.png`);
            if (fs.existsSync(maskFile)) fs.copyFileSync(maskFile, path.join(dest, `mask_${dir}.png`));

            // The fitted garment is the third panel of the generated preview.
            const preview = path.join(ART, `preview_${body.name}_${dir}.png`);
            if (fs.existsSync(preview)) {
                const img = decode(preview);
                encode(path.join(dest, `fitted_${dir}.png`), cut(img, FITTED_PANEL * (PANEL + GAP), 0, PANEL, PANEL));
            }
            console.log(`${body.name} ${dir}: laid out`);
        }
    }
    console.log(`\nunder ${OUT}`);
}

main();
