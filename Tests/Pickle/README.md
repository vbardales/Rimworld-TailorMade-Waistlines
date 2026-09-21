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

## The silhouettes file needs a second unreleased Pickle change

`03-silhouettes.feature` dresses ten pawns, a man, a woman, a boy and a girl, plus a thin, a fat
and a hulking man and woman, each with the body type set on purpose. It needs
`{string} body type is {word}` and `{string} apparel {string} is drawn from {string}`, from
RimWorks/Rimworld-Pickle#32. Stage a build carrying that branch the same way as above; `01`
and `02` do not need it.

Each pawn gets two things. The capture is for a person. The path assertion is not: the game
draws a garment from its texture path plus the body type, so reading what it actually draws
catches a body type that got no trousers or the wrong ones without looking at an image. It says
nothing about the art, which is the same path whoever supplies it.

`gender is male` does not make a man: the body type is a separate fact, and the pawn `01` first
captioned as male was a woman's body. That is why this file sets both, and sets them before the
gear.

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
