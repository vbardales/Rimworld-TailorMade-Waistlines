'use strict';
// Reproduces, outside the game, what TailorMade does to a leg garment, so a
// mask can be judged before testing in RimWorld.
//
// It follows TexBake.BakeFitted: the garment's alpha bounding box is mapped
// onto the mask's alpha bounding box, axis by axis, then the garment's alpha is
// multiplied by the mask. Row-by-row warping is skipped, exactly as it is for
// leg garments, which TailorMade renders with no canvas body.
//
//   node preview.js [--body Female] [--dir south] [--out preview.png]

const fs = require('fs');
const path = require('path');
const { decode, encode } = require('./png');

const BODIES = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies';
const PANTS = 'C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/2264108215/Common/Textures/Core/Things/Pawn/Humanlike/Apparel/Pants';
const MASKS_DEFAULT = path.join(__dirname, '..', 'Mod', 'Textures', 'Things', 'TailoredPants');

const CLOTH = [150, 196, 208];     // the light blue of her screenshots
const OUTLINE = [26, 26, 26];
const OUTLINE_PIXELS = 2;

const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : fallback;
};

function alphaAt(img, u, v) {
    // u, v in [0,1] with v measured from the bottom, as Unity samples textures.
    const x = Math.min(img.width - 1, Math.max(0, Math.round(u * img.width - 0.5)));
    const y = Math.min(img.height - 1, Math.max(0, Math.round((1 - v) * img.height - 0.5)));
    return img.data[(y * img.width + x) * 4 + 3] / 255;
}

function pixelAt(img, u, v) {
    const x = Math.min(img.width - 1, Math.max(0, Math.round(u * img.width - 0.5)));
    const y = Math.min(img.height - 1, Math.max(0, Math.round((1 - v) * img.height - 0.5)));
    const i = (y * img.width + x) * 4;
    return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3] / 255];
}

// Alpha bounds in UV space, v from the bottom.
function alphaBounds(img) {
    const { width: w, height: h, data } = img;
    let minX = w, maxX = -1, minY = h, maxY = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] >= 32) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (maxX < 0) return null;
    return {
        x: minX / w,
        width: (maxX - minX + 1) / w,
        y: 1 - (maxY + 1) / h,
        height: (maxY - minY + 1) / h,
    };
}

function bake(garment, mask) {
    const r = alphaBounds(garment);
    const r2 = alphaBounds(mask);
    const sx = r.width / r2.width;
    const sy = r.height / r2.height;
    const ox = r.x - r2.x * sx;
    const oy = r.y - r2.y * sy;
    const size = Math.max(garment.width, mask.width);
    const out = Buffer.alloc(size * size * 4);
    for (let j = 0; j < size; j++) {
        const v = 1 - (j + 0.5) / size;            // output v, from the bottom
        for (let i = 0; i < size; i++) {
            const u = (i + 0.5) / size;
            const su = sx * u + ox;
            const sv = sy * v + oy;
            const idx = (j * size + i) * 4;
            if (su < 0 || su > 1 || sv < 0 || sv > 1) continue;
            const [cr, cg, cb, ca] = pixelAt(garment, su, sv);
            if (ca <= 0) continue;
            const a = ca * alphaAt(mask, u, v);
            if (a <= 0) continue;
            out[idx] = cr; out[idx + 1] = cg; out[idx + 2] = cb;
            out[idx + 3] = Math.round(a * 255);
        }
    }
    return { width: size, height: size, data: out };
}

// TailorMade traces a dark outline around the clipped garment.
function outline(img, thickness) {
    const { width: w, height: h, data } = img;
    const solid = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) solid[i] = data[i * 4 + 3] >= 26 ? 1 : 0;
    const copy = Buffer.from(data);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (solid[y * w + x]) continue;
            let near = false;
            for (let dy = -thickness; dy <= thickness && !near; dy++) {
                for (let dx = -thickness; dx <= thickness; dx++) {
                    const ny = y + dy, nx = x + dx;
                    if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
                    if (solid[ny * w + nx]) { near = true; break; }
                }
            }
            if (!near) continue;
            const i = (y * w + x) * 4;
            copy[i] = OUTLINE[0]; copy[i + 1] = OUTLINE[1]; copy[i + 2] = OUTLINE[2];
            copy[i + 3] = 255;
        }
    }
    return { width: w, height: h, data: copy };
}

function tint(img, color) {
    const copy = Buffer.from(img.data);
    for (let i = 0; i < copy.length; i += 4) {
        if (!copy[i + 3]) continue;
        const shade = copy[i] / 255;
        copy[i] = Math.round(color[0] * shade);
        copy[i + 1] = Math.round(color[1] * shade);
        copy[i + 2] = Math.round(color[2] * shade);
    }
    return { width: img.width, height: img.height, data: copy };
}

// Nearest-neighbour rescale, only used to bring a small garment texture up to
// the body's canvas for the comparison panels.
function scaleTo(img, size) {
    if (img.width === size && img.height === size) return img;
    const out = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
        const sy = Math.min(img.height - 1, Math.floor(y * img.height / size));
        for (let x = 0; x < size; x++) {
            const sx = Math.min(img.width - 1, Math.floor(x * img.width / size));
            const from = (sy * img.width + sx) * 4;
            const to = (y * size + x) * 4;
            for (let k = 0; k < 4; k++) out[to + k] = img.data[from + k];
        }
    }
    return { width: size, height: size, data: out };
}

// The body silhouette cut down to the band TailorMade uses for a given garment
// class: a fraction of the alpha bounds, measured from the hem upwards.
function band(img, vHi) {
    const box = alphaBounds(img);
    const vTop = box.y + vHi * box.height;
    const cutRow = Math.round((1 - vTop) * img.height);
    const out = Buffer.from(img.data);
    for (let y = 0; y < cutRow; y++) {
        for (let x = 0; x < img.width; x++) out[(y * img.width + x) * 4 + 3] = 0;
    }
    return { width: img.width, height: img.height, data: out };
}

function over(base, top) {
    top = scaleTo(top, base.width);
    const copy = Buffer.from(base.data);
    for (let i = 0; i < copy.length; i += 4) {
        const a = top.data[i + 3] / 255;
        if (a <= 0) continue;
        for (let k = 0; k < 3; k++) copy[i + k] = Math.round(top.data[i + k] * a + copy[i + k] * (1 - a));
        copy[i + 3] = Math.max(copy[i + 3], top.data[i + 3]);
    }
    return { width: base.width, height: base.height, data: copy };
}

function onBackground(img, rgb) {
    const copy = Buffer.alloc(img.data.length);
    for (let i = 0; i < copy.length; i += 4) {
        const a = img.data[i + 3] / 255;
        for (let k = 0; k < 3; k++) copy[i + k] = Math.round(img.data[i + k] * a + rgb[k] * (1 - a));
        copy[i + 3] = 255;
    }
    return { width: img.width, height: img.height, data: copy };
}

function sideBySide(images, gap) {
    const h = Math.max(...images.map(i => i.height));
    const w = images.reduce((s, i) => s + i.width, 0) + gap * (images.length - 1);
    const out = Buffer.alloc(w * h * 4, 0);
    let x0 = 0;
    for (const img of images) {
        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                const from = (y * img.width + x) * 4;
                const to = (y * w + x0 + x) * 4;
                for (let k = 0; k < 4; k++) out[to + k] = img.data[from + k];
            }
        }
        x0 += img.width + gap;
    }
    return { width: w, height: h, data: out };
}

function main() {
    const body = arg('body', 'Female');
    const dir = arg('dir', 'south');
    const out = arg('out', path.join(__dirname, '..', 'Art', `preview_${body}_${dir}.png`));

    const MASKS = arg('masks', MASKS_DEFAULT);
    const bodyImg = decode(`${BODIES}/Naked_${body}_${dir}.png`);
    const garment = decode(`${PANTS}/Pants_${body}_${dir}.png`);
    const mask = decode(path.join(MASKS, body, `Pants_mask_${dir}.png`));

    const PANTS_BAND = 0.58;   // ApparelClassifier.PantsBand
    const today = outline(tint(bake(garment, band(bodyImg, PANTS_BAND)), CLOTH), OUTLINE_PIXELS);
    const ours = outline(tint(bake(garment, mask), CLOTH), OUTLINE_PIXELS);

    const bg = [40, 42, 46];
    const panels = [
        onBackground(bodyImg, bg),                        // the body alone
        onBackground(over(bodyImg, today), bg),           // what TailorMade does today
        onBackground(over(bodyImg, ours), bg),            // through our pants mask
        onBackground(tint(mask, [255, 255, 255]), bg),    // the mask itself
    ];
    fs.mkdirSync(path.dirname(out), { recursive: true });
    encode(out, sideBySide(panels, 8));
    console.log(`wrote ${out}`);
}

main();
