# Attribution

## Summary

**`Mod/` may be published. `Parked/` may not, and is not in this repository.**

What the mod ships is entirely its own: one assembly, written here, patching a
mod that is MIT. Nothing under `Mod/` is derived from anyone else's art, which
is what makes a release possible at all.

`Parked/` is a different matter. It holds the two earlier designs, and their
textures are computed from the art of two mods that grant no licence. They stay
on the author's machine because they are one move from being used again, and
they are kept out of this repository (`.gitignore` lists `Parked/`, `Art/` and
the GIMP projects under `_tools/`) and out of every upload — Steam takes `Mod/`
and nothing else, so the split is the safeguard.

| Item | Origin |
| --- | --- |
| `Mod/Assemblies/TailorMadeWaistlines.dll`, `Source/`, `Tests/`, `_tools/` | written here |
| `Parked/Textures/Pants/*.png` | computed by `_tools/make-garment.js` from the pants of General Textures Collection (3789119336) and the bodies of WDI's Realistic Bodies (3527486510) |
| `Parked/Textures/<Body>/Pants_mask_*.png` | stencils computed from WDI's body art by `_tools/make-masks.js` |
| `Parked/Textures/Female/Pants_paint_*.png` | her own painting, over WDI's body as a guide |

Nothing under `Mod/` is derived from anyone else's art. That is what makes the mod publishable at all.

## What the assembly borrows, and on what terms

**TailorMade** (3756915448, `astryl.tailormade`), by astryl, **MIT**. The mod
is Harmony patches on its internals and calls one of its public methods. Its
assembly is referenced at build time and never redistributed — the project sets
`Private=false` so it stays out of our output folder. MIT permits all of this
without reservation; the licence file is the one in its own distribution.

Reading its code to find `ApparelClassifier.BandFor`, `ConfirmChestArt`,
`TexBake.BakeFitted` and the three band constants was decompilation for
interoperability, which its licence allows outright.

## The parked textures

They are not copies, but they are not ours either.

`Parked/Textures/Pants/` holds 27 garments, nine body types by three facings.
Each is Kas's drawing of a pair of trousers — its cloth, its waistband, its fly
and its button — mapped row by row onto the silhouette of WDI's body, at a
waistline and an outline weight of our choosing. His proportions do not
survive; his design does. **General Textures Collection** (3789119336,
`Kas.GeneralCollection`) carries no licence.

`Parked/Textures/<Body>/Pants_mask_*.png` are black-and-white stencils: the
body from the waist down, eroded so the edge sits inside the drawn outline,
minus the crotch line. No colour, no shading, no pixel of the original
survives — but the **shape** is WDI's, which is the point. **WDI's Realistic
Bodies** (3527486510) carries no licence either.

## What the assembly reads at run time, and on what terms

Neither of these is shipped, copied or written to disk. Both are read from the
player's own installation into memory, and only while the game runs.

**General Textures Collection** (3789119336, `Kas.GeneralCollection`) carries no
licence. Its retexture of the trousers is not loaded when AB's Visible Pants is
active, because its `LoadFolders` gates the folder on XeoNovaDan's. When AB is the
mod supplying a trouser texture and General is installed and active, the
assembly reads General's own `Pants_<body>_<facing>.png` from General's installed
folder and registers the texture with the game, as the game would load it if
General had loaded that folder itself. No file of General's is in `Mod/` or in
this repository. That is the difference from `Parked/`, which holds textures
computed from the same art.

**AB's Visible Pants** (2986402536, `AB.VPLRF`), by aedbia. Its plain shell
textures are read back from the game's memory and, where General has nothing, a
waistband, a fly and seams are drawn onto them and the legs are parted. The
result exists only in memory. Its assembly was also decompiled, to learn that its
categories only exist once a settings file has been read or Reset has been
pressed in its options window; nothing of its code is reused. It is declared in
`loadAfter`, so that this mod's entry is the later one, and not as a dependency.

## Named in the code but not used
- **Female Apparel for Beautiful Bodies** (2881748658) and **Beautiful Bodies**
  (2068281501) were measured and dropped. Nothing of either is here.
