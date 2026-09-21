# In-game scenarios, run by Pickle

The scenarios of [TESTING.md](../../TESTING.md) that a running game is needed for, and only
those. `Mod/` is a companion mod, **TailorMade Waistlines - Pickle tests**, never published.

Everything provable outside the game is proved outside it, by the four sets in `Tests/`:
115 checks in seconds, against tens of minutes of a machine nobody else can use. So the bands
themselves, the clamping of a damaged config, the defaults and which garments the shirt option
lifts appear in no scenario here.

What is left is `01-trousers-review.feature`: how a garment banded into a body drawn without legs
actually reads. A judgement, not an assertion.

## No step assembly

Every step is a Pickle vanilla step. A step written is a step to maintain, and a capture needs
none. If a scenario ever does, `ArchitectStudio/Tests/Pickle/Source/` is the model, and the step
text must carry this mod's name: Pickle loads every active suite's steps into one namespace, and
two suites declaring the same text produce "Ambiguous step" on healthy scenarios.

An earlier version of this suite came with four assertion features and the assembly they needed -
the patch route, the shortcut read off `MainButtonWorker`, the cache sweep counted through
`TexBake.Stats()`, the settings file round trip. They were removed on 2026-09-20 at her request,
with the suite left to the session that owns the captures. They are in the history at `9988515` if
any of it is ever wanted back; what they covered is, for now, covered by nothing.

## What the suite documents

The band. That is the mod, and a capture only means something against it.

`Mod/Defs/TailorPatternDefs/Pants_Native.xml` - the route-B experiment - sets `autoFit false` on
`Apparel_Pants` and `Apparel_KidPants`, which takes the `flag4` branch of `TexBake.BakeFitted` and
never consults the band at all. With that file in place these three scenarios photograph route B
and the pants slider is inert on the very garments they dress the pawn in. The baseline capture is
therefore the one taken with that def **absent**; the route-B capture is a deliberate second run,
not the default.

Nothing in the image says which of the two it is. Until a step attaches the pattern that actually
resolved for `Apparel_Pants`, the only thing telling the two sets apart is which run produced them
- and five runs later the archive is gone.

## What the captures are for, and what they are not

The three scenarios are tagged `@review`. That is not a Pickle tag - its own table is `@wip`,
`@timeout:`, `@seed:`, `@retry:`, `@same-world`, `@allow-errors`, `@film`, `@watch` and
`@quickstart:`. `@review` is this project's convention from AUDIT.md and changes no behaviour: the
images come from the explicit screenshot step. They assert nothing: they dress a pawn in trousers and
nothing else, frame it the same way every time, and attach the image. Green means the route ran,
never that the trousers look right. That judgement is a person's.

The comparison that matters - the band against the native fit - is **across two runs**, not inside
one. `Mod/Defs/TailorPatternDefs/Pants_Native.xml` is read at startup and bypasses the band for
`Apparel_Pants` and `Apparel_KidPants`, so the two states cannot coexist in one game. Run the
suite, move the def file aside, run it again, compare the attachments. Copy both somewhere of your
own first: a run overwrites the previous report, and the archive keeps only the last five.

**And nothing in a report says which of the two it describes.** A step that attached what
`PatternRegistry.Resolve` returned for the garment - no pattern, a pattern with `autoFit` true, or
a pattern with `autoFit` false, which is the native-fit route - existed for an hour on
2026-09-20 and went with the assembly when that was removed. Until something replaces it, the only
thing telling two sets of captures apart is the memory of which run produced them, so **write it
down beside the images when you copy them out**. The suite still documents the band: a run made
with the route-B def in place is photographing something else, and now says so nowhere.

## The Gear tab file needs a Pickle that is not released yet

`02-gear-tab.feature` opens the pawn's own Gear and Bio tabs with
`I open the {string} inspect tab`, a step from RimWorks/Rimworld-Pickle#31. The Workshop copy
does not have it, so a run that stages that copy fails this one file on an undefined step. It is
a file of its own so `01` keeps working against either Pickle.

Until the PR merges, stage a build of its branch:

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/Run-PickleWsl.ps1 -Mod TailorMadeWaistlines -PickleSrc <folder>
```

The folder is a Pickle mod folder built from the `feat/inspect-tab-steps` branch. Copy it out of
whatever scratchpad produced it before using it: a scratchpad belongs to a session that is still
working and can change under a run.

The reason the file exists: `01` found a pawn that the game reports as wearing trousers
(`apparel covers "Legs"` passes just before the shot) and that is drawn with nothing on. The Gear
tab is the game's own list of what a pawn has on, so it is a witness that does not depend on how
anything is drawn.

## The settings seed, and why the WDI+AB pass is not valid without it

AB's Visible Pants is inert on a profile without its settings file. Its category list starts
empty and is filled only when that file is read or when Reset is pressed in its options window
(found by decompiling the installed 1.6 assembly, 2026-09-21). The headless game has no such file,
so every capture taken with AB installed but unseeded shows a pawn with nothing drawn, and the pass
is green and empty.

`Tests/Pickle/config/wdi-ab/Mod_2986402536_ABsVisiblePantsMod.xml` is the seed. The staging copies
it into the profile for the `wdi-ab` pass only and removes it before the next one, so the bare
pass stays bare. Its content is AB's five default categories, copied unchanged from the working
configuration on Virginie's Windows install; the file says so in its own header.

The scenario `AB has actually given the trousers a worn graphic` reads
`Apparel_Pants.apparel.wornGraphicPath` and is the safety net: it goes red when the seed is missing
or stale. A red result there means the pass is invalid, not that the mod is broken.

## Setup, once

Link the companion mod into RimWorld's `Mods` folder. A junction needs no elevation:

```powershell
New-Item -ItemType Junction -Path "C:\Program Files (x86)\Steam\steamapps\common\RimWorld\Mods\TailorMadeWaistlinesPickleTests" -Target "C:\Users\nelim\Documents\rimworld\TailorMadeWaistlines\Tests\Pickle\Mod"
```

Then enable it below TailorMade Waistlines and Pickle.

## Why the optional mods are optional

They were hard dependencies here for a few hours, on the argument that a capture without them
shows nothing. The argument was right about the captures and wrong about the mod: TailorMade
Waistlines works with neither, it simply has nothing visible to do, and a test mod that forces
two downloads to say so describes the wrong thing.

So WDI's Realistic Bodies and AB's Visible Pants are `loadAfter` only, and the trousers scenarios
carry `@requires:` tags for them. The bare pass then skips those scenarios instead of
photographing a bare pawn, and the `wdi-ab` pass — selected with
`Run-PickleWsl.ps1 -DepMap wsl-deps.wdi-ab.map` — is the one that produces the images.

## Running it headless

The WSL2 route, which does not confiscate the machine: `scripts/stage-pickle-wsl.sh` in the
monorepo stages the mod set into the Linux install, then RimWorld is started with
`-pickle-run="TailorMade Waistlines - Pickle tests"` - the companion mod's **display** name, and a
filter matching nothing exits 2 without playing anything. Add `-pickle-no-browser`; WSL has no
`xdg-open`.

Three questions stood in the way of a first run on 2026-09-20. The session working on the headless
route answered all three, and what is checkable here checks out:

- **The extra mods are ours to declare, and are.** `wsl-deps.map` beside this file lists
  `astryl.tailormade`, `wdi.realistic.bodies` and `ab.vplrf` with their Workshop ids;
  `scripts/stage-pickle-wsl.sh` reads it at `$REPO/$MOD/Tests/Pickle/wsl-deps.map` - verified in
  the script - so the shared table no longer has to grow for us.
- **The map is a fixture, not a quickstart.** `the save {string} is loaded` is a Pickle step
  reading `Pickle/Fixtures/` of any active mod, and Pickle ships `test-colony.rws` itself -
  present on disk in the Workshop copy, checked. Nothing to stage, nothing to declare. A
  `@quickstart:` tag exists and would rebuild the world every run, which three captures do not
  need. (The cited `Docs/steps.md` and `Docs/authoring.md` are not in the installed copy here, so
  that part is reported, not verified.)
- **Headless captures are real**: 1920x1080 under Xvfb, full rendering, per that session. Which is
  why no blank-capture guard was written. If a run ever does come back with an empty attachment,
  the guard is a step that reads the file back and refuses one that is trivially small or a single
  flat colour - a step that captured nothing does not fail on its own.

Whichever route, the lock comes first: `%LOCALAPPDATA%\rimworld-pickle-run.lock`, and never a
second RimWorld on the Windows side - that install is hers. `pwsh -File scripts/Pickle-Status.ps1`
names whoever holds the lock.

Teardown on the Linux side is nothing to do: the staging wipes `~/rimworld/Mods` and rewrites its
own `ModsConfig.xml` and `Prefs.xml` every time, and touches nothing on the Windows side. AUDIT.md's
teardown rule is satisfied because nothing shared was changed, not because it stops applying.
