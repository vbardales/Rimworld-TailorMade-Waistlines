# In-game scenarios, run by Pickle

The scenarios of [TESTING.md](../../TESTING.md) that a running game is needed for, and only
those. `Mod/` is a companion mod, **TailorMade Waistlines - Pickle tests**, never published.

Everything provable outside the game is proved outside it, by the four sets in `Tests/`:
115 checks in seconds, against tens of minutes of a machine nobody else can use. So the bands
themselves, the clamping of a damaged config, the defaults and which garments the shirt option
lifts appear in no scenario here. What is left divides in two.

| file | what only a running game can say |
| --- | --- |
| `01-trousers-review.feature` | how a garment banded into a legless body actually reads. A judgement, not an assertion |
| `02-patch-route.feature` | which of the two patch routes is live - Mono's inlining is a property of the process |
| `03-settings-and-shortcut.feature` | whether the bar draws the shortcut, whether its worker opens our page, whether the keys resolve in the language actually loaded |
| `04-sweep-and-repaint.feature` | that closing the window throws away every texture baked against the old band, and the pawns redraw |
| `05-persistence.feature` | that the value reaches the file the game writes and comes back through the game's own Scribe |

## One suite, two halves, and why one of them has no assembly

`01` uses Pickle's vanilla steps only, verified one by one against the expressions in
`RimWorks.Pickle.Vanilla.dll`: a step written is a step to maintain, and a capture needs none.
`02` to `05` need four steps nothing vanilla can supply - reading `Bands.DirectPatchWorks`, a
`MainButtonWorker`'s `Visible` and `Disabled`, `TexBake.Stats()`, and TailorMade's
`PatternRegistry.Resolve` - so they come with `Source/`, built to
`Mod/Pickle/Assemblies/TailorMadeWaistlines.PickleSteps.dll`.

The presence of that DLL costs `01` nothing: a scenario is only touched by the steps it names.
What it does cost is the `-Launch` rule - a step assembly built since the running game started is
not the one loaded, because Pickle reads step assemblies at startup.

Every step text carries the mod's name, because Pickle loads every active suite's steps into one
namespace and two suites declaring the same text produce "Ambiguous step" on healthy scenarios.
`ArchitectStudio/Tests/Pickle/Source/` is the model this follows.

## Build

```powershell
dotnet build Tests\Pickle\Source\TailorMadeWaistlines.PickleSteps.csproj -c Release
```

It binds by name to the shipped `Mod/Assemblies/TailorMadeWaistlines.dll` and to TailorMade's own
assembly, neither of which it redistributes, so build the mod first. Feature files need no build.

## What the assertions deliberately do not decide

`02` accepts either patch route and says which one ran: the direct postfix on
`ApparelClassifier.BandFor`, or the fallback prefix on `TexBake.BakeFitted` for when Mono inlined
the first. What it refuses is a route reported from a flag nobody measured, so it also checks that
the startup self-test logged at all.

`04` records, before anything else, which fitting claims `Apparel_Pants` - see the next section.
A run whose captures and assertions disagree about that is a run whose report explains itself.

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

**Which of the two a report describes is in the report itself**, and it has to be: five runs later
the archive is gone, and nothing else distinguishes one set of screenshots from the other. The
step `the fitting that claims {string} is recorded` attaches what
`PatternRegistry.Resolve` returned for the garment - no pattern, a pattern with `autoFit` true, or
a pattern with `autoFit` false, which is the native-fit route and means the band was never
consulted and every slider of this mod is inert on that garment. `04` goes further and asserts it:
with the route-B def in place, `the band decides the fit of "Apparel_Pants"` fails on purpose,
saying which def claimed the garment. **The suite documents the band.** Route B is an experiment;
when it is present, these are the scenarios that do not apply, and the failure says so rather than
photographing the wrong thing in silence.

## Setup, once

Link the companion mod into RimWorld's `Mods` folder. A junction needs no elevation:

```powershell
New-Item -ItemType Junction -Path "C:\Program Files (x86)\Steam\steamapps\common\RimWorld\Mods\TailorMadeWaistlinesPickleTests" -Target "C:\Users\nelim\Documents\rimworld\TailorMadeWaistlines\Tests\Pickle\Mod"
```

Then enable it below TailorMade Waistlines and Pickle.

## Why the dependencies are dependencies

`About.xml` declares WDI's Realistic Bodies and AB's Visible Pants as hard dependencies, which is
unusual for a test mod and deliberate. Without a body retexture drawn without legs there is no
defect to photograph; without a mod filling `wornGraphicPath` the pawn is drawn bare, because
vanilla `Apparel_Pants` carries no worn graphic at all. Either one missing yields a capture that
looks like a passing run and shows nothing. Declared, the staging script stops instead.

## Running it headless

The WSL2 route, which does not confiscate the machine: `scripts/stage-pickle-wsl.sh` in the
monorepo stages the mod set into the Linux install, then RimWorld is started with
`-pickle-run="TailorMade Waistlines - Pickle tests"` - the companion mod's **display** name, and a
filter matching nothing exits 2 without playing anything. Add `-pickle-no-browser`; WSL has no
`xdg-open`.

Two things are needed before that works, and neither is written yet:

- The staging script's `packageId -> Workshop folder` table knows five mods and this is not one of
  them. It needs `nelim.tailormade.waistlines`, and `wdi.realistic.bodies` and `ab.vplrf` with it.
- **How a map comes to exist in an autorun is unresolved for this suite.** The QuietNewFactions
  scenarios run at the main menu and need none; `a colonist {string} exists` does. Pickle carries a
  quickstart bridge, and the tag is `@quickstart:<name>`; which name it takes here, and whether it
  makes `rimworks.quickstarts` a dependency of the companion mod and of the staged set, is the open
  question.

Whichever route, the lock comes first: `%LOCALAPPDATA%\rimworld-pickle-run.lock`, and never a
second RimWorld.
