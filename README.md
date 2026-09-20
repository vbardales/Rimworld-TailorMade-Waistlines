# TailorMade Waistlines

Decides where garments stop on the body. An add-on to TailorMade, which is
MIT, and not affiliated with it.

Meant for release. Only `Mod/` is uploaded, and it holds nothing but this
project's own work — see [ATTRIBUTION.md](ATTRIBUTION.md). `Parked/` never leaves
the author's machine and is not in this repository: it carries textures derived
from art that grants no licence.

It began as a set of pants cut to one body's silhouette, under another name. It
ended as three numbers that fix every leg garment of every mod at once, which
is why both the name and the packageId changed before anyone had them.

## The problem

TailorMade sorts apparel into classes and fits each class into a horizontal
band of the body's alpha bounds — 0 at the hem, 1 at the top of the head:

| class | band | meaning |
| --- | --- | --- |
| Pants | `(0, 0.58)` | the bottom 58% |
| Boots | `(0, 0.20)` | the bottom fifth |
| Chest | `(0.45, 1)` | the top 55% |

In `TexBake.BakeFitted` the target rectangle is literally
`AlphaBoundsUVInBand(body, band.x, band.y)`, so a band's edges are where the
garment's edges land. Those numbers suit a body drawn with legs. On a body
retexture drawn as one legless shape, 58% of the way up from the hem is above
the navel, and trousers read as a high-waisted skirt.

Nothing in TailorMade exposes them: they are `static readonly Vector2`
constants, and its settings do not mention them.

## What this mod does

Two Harmony patches and a settings window. No textures, no defs.

**The bands become settings.** A postfix on `ApparelClassifier.BandFor`
returns our values instead of the constants. That is the better of the two
places to patch, because TailorMade builds its texture cache key from the
band's value — so a band changed at the source invalidates the cache by itself
and no stale texture survives.

**A fallback, on purpose.** `BandFor` is a small static method returning a
switch over static fields, which Mono may inline into its caller; an inlined
method is one Harmony has nothing left to patch. So a prefix on
`TexBake.BakeFitted` corrects the band again where it arrives, in a method far
too large to be inlined. It only rewrites a band still holding its stock value,
so when the first patch worked this one does nothing. A self-test at startup
says in the log which of the two is doing the work:

```
[TailorMade Waistlines] band patch active on ApparelClassifier.BandFor.
```

**An option for shirts.** TailorMade only bands a torso garment once
`ConfirmChestArt` has seen that its art already starts 40% of the way up the
texture. The test is sound — it stops the mod squashing a garment never drawn
as a crop top — but it excludes exactly the garments that need it: a vanilla
shirt is drawn over the whole body, so it stays full length and hides the
trousers whatever the trousers do. Its author says in the tooltip of the setting it guards what the test is for:
"long coats and capes that drape down the body are left full-body" — which is
right, and is why the option cannot simply lift it. A postfix lifts it for
**on-skin garments only**: vanilla is consistent here, shirts and tribalwear
being OnSkin while dusters, parkas, jackets and robes are Shell. Off by
default, and note that the band **scales** the art into itself rather than
cropping, so the shirt is compressed, collar and buttons included.

Closing the settings window calls `TailorMade.TailorMadeCache.ClearAndRepaint()`,
which sweeps every cached fit and repaints the pawns already on the map.

## What it does not do

It does not give any garment a texture. Vanilla trousers carry no
`wornGraphicPath` at all — the game draws nothing on the pawn — so a mod that
fills that field is still required. AB's Visible Pants does it, from its own
90 textures, once its categories exist; see TESTING.md for the trap there.

## Layout

```
Mod/                    everything that ships, and nothing else
  About/About.xml       nelim.tailormade.waistlines; needs Harmony and TailorMade
  Assemblies/TailorMadeWaistlines.dll
Parked/                 earlier routes: art derived from other mods. Local only, not in this repository
Source/TailorMadeWaistlines/      Bands.cs, ChestArt.cs, TailorMadeWaistlinesMod.cs
Tests/Check-Mod.ps1     reflection over TailorMade: 22 checks, no game started
_tools/*.js             measurement and generation, for the parked route
Art/                    generated previews and contact sheets. Local only, not in this repository
```

## The tools

They belong to the route that shipped textures, which is parked but not dead.
They need no dependency beyond Node: `png.js` reads and writes PNG by hand.

| tool | what it answers |
| --- | --- |
| `compare-bodies.js` | how close two body retextures are, as silhouette overlap |
| `measure-navel.js` | where the navel sits, as a fraction of the body |
| `measure-waist.js` | where a garment's waistband sits against the body |
| `measure-outline.js` | how heavy the drawn black edge is, theirs against ours |
| `make-garment.js` | builds a garment fitted to one body, from another's art |
| `make-gimp-bodies.js` | a GIMP project stacking every body retexture on disk |
| `waist-sheet.js` | a contact sheet of one body at several waist heights |
