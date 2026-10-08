'use strict';
// Where WDI draws the bust: the nipples, found as the pink pixels of the south view, and the widest row of the silhouette
// above the waist. Rows are fractions of the 512 px picture counted from the top.
//   node measure-bust.js
const { decode } = require('./png');
const WDI = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
for (const body of ['Female', 'Thin_Female', 'Fat_Female', 'Hulk_Female', 'Male', 'Thin', 'Fat', 'Hulk']) {
    const { width: w, height: h, data } = decode(`${WDI}/Naked_${body}_south.png`);
    let sx = [], sy = [], top = h, bottom = -1;
    const at = (x, y, c) => data[(y * w + x) * 4 + c];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (at(x, y, 3) < 128) continue;
        top = Math.min(top, y); bottom = Math.max(bottom, y);
        const r = at(x, y, 0), g = at(x, y, 1), b = at(x, y, 2);
        // nipples: pink, redder than the skin around (r clearly above g and b, not grey)
        if (r > 215 && r - g > 20 && r - b > 25 && g < 232 && g > 190) { sx.push(x); sy.push(y); }
    }
    if (!sx.length) { console.log(body.padEnd(12), 'no pink pixels', 'body rows', top, bottom); continue; }
    const mid = (Math.min(...sx) + Math.max(...sx)) / 2;
    const L = sx.map((x, i) => [x, sy[i]]).filter(p => p[0] < mid), R = sx.map((x, i) => [x, sy[i]]).filter(p => p[0] >= mid);
    const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
    console.log(body.padEnd(12), 'rows', top, '..', bottom,
        '| nipple y', (avg(sy) / h).toFixed(3), 'L x', avg(L.map(p => p[0])).toFixed(0), 'R x', avg(R.map(p => p[0])).toFixed(0),
        'gap', (avg(R.map(p => p[0])) - avg(L.map(p => p[0]))).toFixed(0), 'px', sx.length);
}
