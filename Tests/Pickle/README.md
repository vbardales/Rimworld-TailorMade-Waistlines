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

The trousers as the mod leaves them. Where AB supplies the trousers, the mod registers better art
for them at startup and, for each body type it supplied art for, creates a `TailorPatternDef` that
tells TailorMade to leave those trousers alone (`TrouserArt`). TailorMade would otherwise stretch art
that is already drawn for the body into its band. With both art options off, or without AB, nothing
is registered, no def is made, and TailorMade fits the trousers and answers the pants slider as it
always did. The captures here are of the first state.

The second state, the band, is a different game start and not a step of a scenario: the choice is
made at startup. It would be a pass of its own whose seed is this mod's settings file with both art
options off. That pass does not exist yet.

Nothing in an image says which state produced it. Two things do: the pass name the report carries
(`-pickle-set-name`), and the scenario that asserts the def exists, which goes red in the band state.
Write down which run produced a report when you copy it out: the archive keeps only the last five.

## What the captures are for, and what they are not

The capture scenarios are tagged `@review`. That is not a Pickle tag - its own table is `@wip`,
`@timeout:`, `@seed:`, `@retry:`, `@same-world`, `@allow-errors`, `@film`, `@watch` and
`@quickstart:`. `@review` is this project's convention from AUDIT.md and changes no behaviour: the
images come from the explicit screenshot step. They assert nothing about the image: they dress a pawn
in trousers and nothing else, frame it the same way every time, and attach it. Green means the route
ran, never that the trousers look right. That judgement is a person's.

Two things keep a green from being empty. The scenarios that read a def field (`wornGraphicPath`, the
pattern def) fail when AB is inert or the step did not run, and one asserts the step logged no
warning. A pawn that the game reports as wearing trousers, checked just before each capture, is not
a pawn that is drawn wearing them: the first runs showed a bare pawn under a green report.

## The Gear tab file takes its steps from a PickleTools package

`02-gear-tab.feature` opens the pawn's own Gear and Bio tabs, which the stock Pickle cannot do:
nothing in it reaches the tabs of the inspect pane. Those steps exist twice — as
RimWorks/Rimworld-Pickle#31, waiting for a merge, and as `nelim.pickletools.inspecttabs`, a
companion mod that carries them as steps and runs on the **stock** Pickle.

The package is the route, and `-PickleSrc` is not. A suite that stages a locally modified Pickle
tests a Pickle nobody else has, and the clean-up the day the PR merges is a folder to delete rather
than a build to remember. So every pass map here carries one line:

```
nelim.pickletools.inspecttabs   path:PickleTools/InspectTabs/Mod
```

including `wsl-deps.tools.map`, which is the bare pass plus this one tool. Run the bare pass with
`-DepMap wsl-deps.tools.map`. A run that names no map reads none at all, because the runner sets
`PICKLE_DEPMAP=none`, so no default file can carry the line for it. That pass is named `tools` in
its report, the map's file name without `wsl-deps.` and `.map`. The Gear tab matters most there,
where nothing is drawn and the game's own list is the only witness. The `path:` form is relative to
the collection root, so `PickleTools` has to be cloned beside this mod.

Its steps carry the prefix `Nelim's Pickle Tools: `, which is how that repository keeps every step
text unique across Pickle and every suite. The day #31 merges, the package line goes and the prefix
goes with it.

The reason the file exists: `01` found a pawn that the game reports as wearing trousers
(`apparel covers "Legs"` passes just before the shot) and that is drawn with nothing on. The Gear
tab is the game's own list of what a pawn has on, so it is a witness that does not depend on how
anything is drawn.

## The silhouettes file: ten scenarios, on a PickleTools step

`03-silhouettes.feature` dresses ten pawns, a man, a woman, a boy and a girl, plus a thin, a fat and a
hulking man and woman. It was first written against `{string} body type is {word}` and `{string}
apparel {string} is drawn from {string}` of RimWorks/Rimworld-Pickle#32, not released, so all ten failed
on an undefined step in every pass (git `d9e8aa0`). The released Pickle sets a gender, an age and a
backstory and no body type (`gender is male` does not make a man: the pawn `01` first captioned as male
was a woman's body), so for a while it was three scenarios on the fixture's own colonists (git
`a941b2c`).

It is ten again with `nelim.pickletools.colonistrace`, the PickleTools package every WDI pass map now
names: `Nelim's Pickle Tools: "<pawn>" body type is <word>` removes every body-type gene the pawn has
and adds the one asked for, so a xenotype with several cannot pick another, and
`has body type <word>` reads it back after the wait. The gender is set before, the gear after. It needs
Biotech for the genes and is Nelim's, not Pickle's: **when #32 merges, the package line and the prefix go.**

A boy and a girl are the open point: Child is the body of an age, not a gene's, and the step refuses it,
so their age is set and read back. Whether setting the age alone changes the body type, without the
game starting a life stage, is what those two find out.

Not asserted, because no released step reads it: the texture path actually drawn, which the PR #32 version
asserted. What stays is the body type read back, `no warning matching "Could not load
UnityEngine.Texture2D"` and the capture for a person. No `@requires:ab.vplrf`: any pass with WDI and a
supplier of trousers runs it, so the XND passes do too.
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

- **The extra mods are ours to declare, and are.** This is the first-run account of 2026-09-20,
  when one `wsl-deps.map` listed the three mods; that file is gone. Today the ids of
  `astryl.tailormade`, `wdi.realistic.bodies` and `ab.vplrf` are in `wsl-ids.map`, each pass has a
  map of its own (`wsl-deps.wdi-ab.map`, `wsl-deps.wdi-ab-general.map`, `wsl-deps.tools.map`) chosen
  with `-DepMap`, and a run that names none reads none. `scripts/stage-pickle-wsl.sh` finds them in
  `$REPO/$MOD/Tests/Pickle/`, so the shared table no longer has to grow for us.
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
