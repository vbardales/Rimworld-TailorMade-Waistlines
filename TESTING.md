# TailorMade Waistlines — in-game test scenarios

`Tests/Check-Mod.ps1` runs beside this file and never starts the game. It
checks that every method and constant this mod reaches into still exists and
still means what the code assumes. None of that is a single tick of play. This
file is the list of what has to be watched in a running colony, and what counts
as a pass.

It is not shipped: it lives beside `Mod/`, never inside it.

## Before starting

- RimWorld 1.6, with Harmony and TailorMade active, and this mod after both.
- A mod that gives leg garments a worn graphic. Vanilla trousers carry none, so
  without one the game draws nothing and every scenario below fails for a
  reason that has nothing to do with this mod.
- A body retexture drawn without legs. The mod does nothing wrong on a vanilla
  body; it simply has nothing to correct.

### The trap that costs an evening

**AB's Visible Pants forgets its own categories.** Its `ExposeData` creates the
five defaults on load and then, two lines later, `Scribe_Collections.Look`
overwrites them with the empty list saved in its config. Its settings screen is
then blank, `AVPCache.pants` stays empty, and it assigns no texture at all — so
pawns are drawn bare and it looks as though this mod broke something.

Its **Reset** button, on the *Advanced Settings* tab, fills the list in memory.
It is applied in `AVPCache`'s static constructor, which runs at startup, so the
sequence is: press Reset, close, **restart**. Check
`Config/Mod_2986402536_ABsVisiblePantsMod.xml` afterwards — if `<datas />` is
still empty, it did not take.

## Scenarios

### 1. The patch is live, and by the right route

Start the game and read `Player.log`. Exactly one of these appears:

- `[TailorMade Waistlines] band patch active on ApparelClassifier.BandFor.` — pass.
- `... looks inlined; falling back to TexBake.BakeFitted` — also works, but
  a slider change then needs a restart, because TailorMade's cache was keyed on
  the old value. Worth knowing before judging anything else.

### 2. Nothing changes until asked

With the settings untouched, a pawn looks exactly as it did before the mod was
installed. The defaults are TailorMade's own numbers. If anything moved, the
patch is returning something it should not.

### 3. The waistband follows the slider

One pawn, trousers, facing south. Lower **Pants reach up to** from 0.58 to 0.40
and close the window. The waistband drops, the hem does not move, and the pawns
already on the map repaint without a reload.

Measured reference points, on WDI's bodies at 512: the navel sits at 0.52 of
the body's height on Female, 0.48 on Male, 0.46 on Fat, 0.58 on Thin. A
waistband below all of them needs roughly 0.42 or lower.

### 4. Every body type

Character Editor gives one of each in two clicks. Nine to look at: Female,
Male, Thin, Thin_Female, Fat, Fat_Female, Hulk, Hulk_Female, Child.

- Hulk and Hulk_Female are the tall ones — their art reaches row 495 where
  Female stops at 443. A height error shows there first.
- Child wears `Apparel_KidPants`, a separate def from `Apparel_Pants`. Whatever
  supplies the art has to cover it; AB's does, because its keyword is the
  substring `Pants`.

### 5. Four facings

West is mirrored from east by the game. Turn a pawn all the way round and watch
for a jump between the two.

### 6. Shirts, and the compression

Tick **Shorten full-body shirts** and lower **Chest pieces start at**. A
vanilla button-down shirt should stop short and let the trousers show.

Then put a duster on the same pawn. It must still reach the ankles: the option
is limited to on-skin garments for exactly this reason, and a shortened duster
is a bug, not a taste question.

The question this scenario exists to answer is not whether it works but whether
it *reads*: the band scales the art into itself rather than cropping, so the
collar and buttons are squeezed along with the hem. If that looks wrong, the
answer is to crop in our own bake, which is a real piece of work and has not
been written.

### 7. Boots

Lower **Boots reach up to** and check that footwear from any mod follows. This
is the band nobody has looked at yet.

### 8. Save, load, and settings

Change all three sliders, save, quit, restart, load. The values survive, and
the pawns are drawn with them from the first frame rather than after a repaint.

## What is not covered

- Alien races. TailorMade has its own HAR handling and this mod does not touch
  it; the bands apply to whatever it classifies.
- The parked texture route under `Parked/`. It has its own conditions, and
  bringing it back means bringing back all three of its files together.
