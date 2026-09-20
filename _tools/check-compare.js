'use strict';
// Every file gimp-compare.scm will try to load, checked before GIMP does.
//
//   node check-compare.js
//
// A missing file is skipped in silence by the script, which is what we want
// for the variants Kas never drew - but silence is also how a wrong path
// looks. This prints the grid so the holes are the expected ones.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const KAS = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3789119336/Mods/VisiblePants/Textures/Core/Things/Pawn/Humanlike/Apparel/Pants';
const FITTED = path.join(ROOT, 'Mod/Textures/Things/TailoredPants/Apparel/Pants');

const BODIES = ['Female', 'Male', 'Thin', 'Thin_Female', 'Fat', 'Fat_Female',
    'Hulk', 'Hulk_Female', 'Child', 'FurChild'];
const FACINGS = ['south', 'north', 'east'];

const mark = f => fs.existsSync(f) ? 'x' : '.';

let bodies = 0, kas = 0, fitted = 0;
console.log('body            body   kas    fitted     (x present, . absent)');
for (const body of BODIES) {
    const row = FACINGS.map(f => [
        mark(`${WDI}/Naked_${body}_${f}.png`),
        mark(`${KAS}/Pants_${body}_${f}.png`),
        mark(path.join(FITTED, `Pants_${body}_${f}.png`)),
    ]);
    for (const [b, k, t] of row) {
        if (b === 'x') bodies++;
        if (k === 'x') kas++;
        if (t === 'x') fitted++;
    }
    const col = i => row.map(r => r[i]).join('');
    console.log(`${body.padEnd(14)}  ${col(0)}    ${col(1)}    ${col(2)}`);
}
console.log(`\n${bodies} body textures, ${kas} of Kas's, ${fitted} interpreted, ` +
    `out of ${BODIES.length * FACINGS.length} slots each`);
if (!bodies) {
    console.log('no body texture found at all: the WDI path is wrong, not the file list');
    process.exit(1);
}
