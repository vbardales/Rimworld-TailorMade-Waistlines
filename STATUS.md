---
mod:          TailorMade Waistlines
packageId:    nelim.tailormade.waistlines
repo:         https://github.com/vbardales/Rimworld-TailorMade-Waistlines
visibility:   public
detached:     yes
stage:        preTest
workflow_state: preTest
workflow_audited: 2026-09-20
localization: complete
translation_en: complete
translation_fr: complete
settings_audit: complete
dependencies_audit: complete
licence:      original
licence_at:   "MIT, chosen 2026-09-20 (LICENSE at the root and in Mod/), matching TailorMade, which is MIT. Nothing is copied from it: it is referenced at build time and patched through Harmony. Mod/ is publishable: one assembly of our own, patching TailorMade, which is MIT. Parked/ is not, and never ships - its textures are computed from General Textures Collection (3789119336) and WDI's Realistic Bodies (3527486510), neither of which grants a licence. Steam uploads Mod/ only, which is the safeguard, and Parked/, Art/ and the GIMP projects are kept out of the public repository by .gitignore. See ATTRIBUTION.md."
dependencies: "brrainz.harmony and astryl.tailormade, both required. A mod that gives leg garments a worn graphic at all, since vanilla trousers carry none - tested with AB.VPLRF. A body retexture drawn without legs is the reason the mod exists, tested with wdi.realistic.bodies, but nothing in the code names it."
original:     none
showcase:     Mod/About/Preview.png (896x504, 667 kB, title overlay) and Mod/About/ModIcon.png (128x128, 28 kB), both inspected 2026-09-20. Local sources in Art/ (ignored by git): Preview.png and ModIcon-source.png, the untouched illustrations; preview.html, preview-palette.json and render-preview.cjs compose the Preview; make-icon.cjs cuts the icon; preview-qa.json holds the measurements
tested_on:
workshop:
automated_tests: "Tests/Check-Mod.ps1 22/22 (TailorMade still looks the way the patches assume), Tests/Check-Localization.ps1 36/36 (keys, French coverage, placeholders, no hardcoded sentence, hidden shortcut), Tests/Check-Settings.ps1 17/17 (defaults, reset, clamping), Tests/Check-Logic.ps1 40/40 (our own patch bodies: the band per slider, the classes left whole, the fallback's recognition tolerance, which garments the shirt option lifts), all run 2026-09-20 on the rebuilt DLL through Tests/Run-Tests.ps1, none starting the game; the three new ones were seen failing under a mutation. XML, all four run 2026-09-20 by the second audit over Mod/ and all clean: scripts/Check-DefInjected.ps1 (2 keys, 0 errors), Check-XmlFields.ps1 (3 files, every element maps to a 1.6 field), Check-DefRefs.ps1 (2 defs, well-formed, every reference resolved), Check-TypeRefs.ps1 (the one third-party type, TailorMade.TailorPatternDef, is guarded by the hard dependency). Pickle: Tests/Pickle holds one feature, 01-trousers-review, three captures that assert nothing. The four assertion features and their step assembly were written on 2026-09-20 and removed the same evening at her request, the suite being left to the session that owns the captures; they are in the history at 9988515. NEVER RUN: nothing is known about whether any of it passes, and preTest -> done needs it green. Check-Logic's earlier failure at the ApparelLayerDefOf initialiser is fixed: the DefOf guard is told binding is in progress, and the def is then a static field the test fills itself. What no set covers is a baked texture - every band is checked as a number, never as pixels."
manual_scenarios: "TESTING.md, 11 scenarios, none run"
remaining:
  - "unverified (done -> tested), showcase: neither image has been seen in game or on a Workshop page. The icon is the mascot with a tape measure round it, cropped from the generated image: it does not show the trousers the prompt asked for, and the source carried a title plate and a glow, both cut away. Regenerate it only if she wants trousers."
  - "feature/housekeeping: ModsConfig.xml still lists the retired packageId nelim.tailoredpants beside nelim.tailormade.waistlines; RimSort shows it as a missing active mod. She chose to remove it herself; nothing was touched. The rename note further down says the line was rewritten in place, which the file does not bear out."
  - "unverified (done -> tested): the settings were verified from the sources and by automated checks, not in game. `settings_audit: complete` rests on that basis (the workflow states that in-game checks belong to done -> tested). Still to observe: defaults on a clean configuration, each slider's effect, persistence across a restart and a save, the ClearAndRepaint refresh, the Reset button, the hidden shortcut in RIMMSQOL, English and French display and clipping. Earlier note, kept: no setting has been changed in game, no settings file has been written, and the defaults, persistence, reset, clamping and the ClearAndRepaint refresh have never been exercised. Player.log (last written 2026-09-20 14:42) predates the rename and the current DLL and contains no line from this mod, so it is not evidence for the shipped build."
  - "unverified (done -> tested): all 11 scenarios of TESTING.md, FR and EN display, RIMMSQOL shortcut. The language pass counts only in developer mode: outside it a key missing from French falls back to clean English and the defect is invisible, so such a capture is no evidence for the l10n criterion. In developer mode the fallback is accented letter by letter, and clean English inside the French means a literal that never went through Translate."
  - "renamed on 2026-09-20, before anyone had it: TailorMade Waistlines, packageId nelim.tailormade.waistlines, folder TailorMadeWaistlines, assembly TailorMadeWaistlines.dll, namespace TailorMadeWaistlines, Harmony id nelim.tailormade.waistlines. The junction at RimWorld/Mods was repointed and her ModsConfig line was rewritten in place (backup: ModsConfig.xml.before-rename). Renaming a packageId costs nothing only while the mod has never been published - that window is now closed."
  - "the plan, hers: two modules above TailorMade. This one is the engine and names no body mod. A second, TailorMade Waistlines for WDI Realistic Bodies, carries the values. For the split to be worth its cost the preset must be pure XML, so the engine has to define a def type - targetBodyMod plus a value per body type - and apply the preset whose target mod is loaded, with the sliders as the manual override."
  - "per body type is the missing piece, and it is measured: within WDI alone the navel runs from 0.46 on Fat to 0.58 on Thin, so one slider is already a compromise over nine bodies. BandFor only receives the apparel class. Graphic_TailorMade.Init calls PatternRegistry.ResolveFor(race, bodyType, layer, ...) before it calls BandFor, so a postfix on ResolveFor can hold the resolved body type for our BandFor postfix to read. TailorMade keys its texture cache on the body mask instance, so two body types cannot collide. Not written."
  - "dead end, measured 2026-09-20 by _tools/measure-waist-anchor.js: deriving the waistline from the body art at run time does not work. The geometric anchor - narrowest row of the lower silhouette - hits the search bounds on most bodies (WDI Male 0.22, Hulk 0.21, Fat 0.66) because those silhouettes never stop narrowing; and the navel detector returns nonsense on other mods (0.20 on ScrubDaddy Female). Neither repere survives a change of body mod. The values have to be authored, which is exactly what the preset module is for."
  - "before a release: draw a Preview.png and a ModIcon.png. Licence (MIT) and visibility (public, Parked/ and Art/ kept out) were settled on 2026-09-20."
  - "the brief, stated 2026-09-20: the fitting must be automatic, computed at render time for every garment of every mod. No textures drawn or generated in advance. Two earlier routes that shipped art are parked under Parked/ with a README saying what each answered and how to bring it back."
  - "the shirt option is restricted to on-skin garments, 2026-09-20. TailorMade only bands a torso garment whose alpha already starts at 0.4 of the texture height, and astryl states the reason in the tooltip of the setting it guards: long coats and capes must keep draping. Lifting it outright would have shortened dusters too. Vanilla separates them cleanly by layer - shirts and tribalwear OnSkin, dusters, parkas, jackets and robes Shell - so the postfix only lifts the test when apparel.LastLayer is OnSkin."
  - "unverified, and the question the next session turns on: does a compressed shirt read acceptably? The chest band SCALES the art into itself, it does not crop, so collar and buttons squeeze with the hem. If it reads badly the answer is to crop in our own bake - real work in the assembly, not yet written."
  - "unverified: everything in TESTING.md. The mod has been loaded in game and the log confirms the direct patch is the one running, but no slider has ever been moved - no settings file has been written."
  - "AB's Visible Pants loses its own categories: its ExposeData creates the five defaults on load, then Scribe_Collections.Look overwrites them with the empty list in its config. Its screen is blank, AVPCache.pants stays empty, and it assigns no texture at all. The Reset button on its Advanced Settings tab fills the list; AVPCache's static constructor applies it, so a restart is needed. Its config was written by hand on 2026-09-20 at 14:01 after the button failed to persist."
  - "measured on AB's own art, which is what the automatic route now leans on: 90 textures over Pants, Jeans, Shorts, Skirt and Trousers, six body types by three facings, none empty, at 128. Pants_Male_south runs rows 89..107 of 128, a waist at 0.30 of the body height - already lower than the 0.32 the generated set had settled on by hand."
  - "body survey, by _tools/compare-bodies.js: silhouette overlap, every mod resampled to 512 first because they are drawn at 128, 256 or 512 and the game scales them all to the same square. Two families. The vanilla-footprint one bottoms out between rows 443 and 452 and holds WDI, Beautiful Bodies, Kas, ScrubDaddy, RimNudeWorld, [Ry] HD, Despicable and Sized Apparel for RJW. The other bottoms between 474 and 511 - bigger pawns, not merely legged ones - and holds Xeva, Caked Up Pawns, Advanced Combo, Not So Pretty and SizedApparel-Realistic Body. Core has no body texture on disk at all, so it is placed by XND's pants, which are drawn for it: row 452, inside the first family."
  - "Beautiful Bodies (2068281501) is delisted from the Workshop - its page errors - but still installs. Its body art IS Kas's, byte for byte. It is the centre of the vanilla-footprint family: [Ry] 0.952, RimNude 0.947, ScrubDaddy 0.944, Despicable 0.938, WDI 0.893. WDI is that family's widest, by up to 47px."
  - "THIGAPPE cannot be reused: its 1.6 human support is gated on Nals.CompatibleBody2, Nals.RealisticBody, Xeva.XevaFBpack.11 and ABC.abcBody2, all in the other family."
  - "Female Apparel for Beautiful Bodies (2881748658) was tried as the art source and dropped the same afternoon. Of its 180 textures 26 hold 0 opaque pixels, and 24 of those are its pants and flak pants - only the Female body is drawn, and its patch fills wornGraphicPath unconditionally, so a pawn wearing trousers was rendered bare. Its other 60 garments are sound."
  - "measured on WDI, and what the parked generator is calibrated on: cloth median 251 and 5th percentile 179 on his underwear; centre seam 4px at tone 179 against cloth 253; groin arc 2-3px around 190; the crotch wedge on the naked body 5px wide at its top and 12px at the hem; his ink is 0, not 26; one intermediate alpha step at every edge. Navel heights, as a fraction of the body: Female 0.52, Male 0.48, Fat 0.46, Thin 0.58, Hulk 0.48."
  - "undecided: whether to cover boots and chest in anger. The sliders exist; nobody has looked at what they do."
  - "local modification in progress, left untouched by the 2026-09-20 second audit: Mod/Defs/TailorPatternDefs/Pants_Native.xml is untracked and ships with Mod/ as it stands. It is route B - autoFit false on Apparel_Pants and Apparel_KidPants so the drawing keeps its native proportions instead of being stretched into the band - and its own comment says that while it is active the pants slider has no effect on those two garments. Structurally clean (Check-XmlFields, Check-DefRefs, Check-TypeRefs), no player-facing text, so localization is unaffected. It means the shipped folder no longer matches the committed tree, and that any in-game reading of the pants slider on vanilla trousers is a reading of this def, not of the band."
  - "unpushed: commit c548d57 (the Check-Logic and Run-Tests sets, TESTING.md) is on the local main only; origin/main is at fe0baae. GitHub does not carry the test sets."
  - "done 2026-09-20, the Mentions of PUBLISHING.md: the About.xml description and README.md now carry thanks (astryl and TailorMade's MIT licence, brrainz for Harmony, aedbia for AB's Visible Pants, WDI's bodies as the reason the problem exists), an AI notice (the two images generated by an image model and recomposed; the assembly, tests and documentation written with Claude Code, recorded as a co-author in the history) and the adoption clause, in that order and before the source link, which is still the last thing the description says. The description is UN SEUL COUP - sent only when the Workshop item is created - so what ships is what is in About.xml at that moment."
updated:      2026-09-20
---

# TailorMade Waistlines — status

## What exists — 2026-09-20

One assembly and a settings window. No textures, no defs. It turns the three
bands TailorMade fits garments into into settings, and offers to lift the one
guard that keeps full-body shirts out of that mechanism.

`Tests/Check-Mod.ps1` passes: 22 checks by reflection over TailorMade's own
assembly, no game started.

## What was measured, not assumed

- Vanilla `Apparel_Pants` has **no `wornGraphicPath`** in
  `Core/Defs/ThingDefs_Misc/Apparel_Various.xml`: the game never draws pants.
  Filling that one field is all any visible-pants mod does, and this mod does
  not do it.
- In `TexBake.BakeFitted` the target rectangle is
  `AlphaBoundsUVInBand(body, fitBand.x, fitBand.y)` — the band's edges are
  literally where the garment's edges land. `fitBand` comes from
  `ApparelClassifier.BandFor`, whose three constants are `static readonly` and
  exposed by nothing.
- `ConfirmChestArt` requires a torso garment's alpha to start at 0.4 of the
  texture height before it will band it. A vanilla shirt starts at 0, so its
  class falls back to `None` and it is never shortened — whatever the trousers
  do underneath.
- TailorMade ships **no defs at all**: an assembly, one UI texture and a single
  patch unlocking race-restricted apparel. It detects a body retexture at run
  time by comparing the loaded body texture against the Core-only one, so it
  needs nothing written for a particular body mod.
- Of the three visible-pants mods, Pawn Visible Pants (2985986536) is
  overridden by XND whatever the load order, by its own author's admission.
  Only one of the three can matter at a time.

## Next

Answer scenario 6 of TESTING.md: whether a compressed shirt reads acceptably.
Everything else waits on that, because the alternative — cropping in our own
bake instead of letting TailorMade scale — is the only piece of real work left
on the list.

## Workflow audit — 2026-09-20

**Result: `dansMonoRepo`.** Previous declared stage: `preTest`. That value was not
supported: the first transition (`dansMonoRepo -> horsMonoRepo`) is not met, and the
later gates each have a concrete gap.

### How `stage` maps to the workflow

`stage` keeps its six historical values; the precise state is in `workflow_state`.

| stage | workflow states |
| --- | --- |
| port | dansMonoRepo, horsMonoRepo |
| showcase | ModIcon générée, Preview générée |
| preTest | preOptions, options, l10n, preTest |
| done | done |
| tested | tested |

### Audited revision

- No revision of its own: the folder is untracked in the monorepo (`git status`: `?? TailorMadeWaistlines/`;
  monorepo HEAD `dcf0dc5f`, unrelated to this mod). Everything in it is a local, uncommitted state.
- `Mod/Assemblies/TailorMadeWaistlines.dll`, SHA-256 `624f0d76…5ec70`, 10240 bytes.
- **Concurrent edit noticed at the end of the audit.** Between 18:33:07 and 18:33:48 another session changed
  `ChestArt.cs`, `TailorMadeWaistlinesMod.cs`, `About.xml`, README.md and TESTING.md (the shirt option is now limited
  to on-skin garments, label "Shorten full-body shirts") and rebuilt the DLL (SHA-256 `d96766dd…a937`).
  The build-identity and hash checks below were made on the earlier state and are not carried over to the new
  DLL. `Tests/Check-Mod.ps1` was re-run on the new DLL: 22/22 passing. The `dansMonoRepo` conclusion does not
  depend on those files. The settings UI changed, so `settings_audit` and `localization` would be `unchecked`
  in principle; they stay `partial` because the defects under `remaining` are unchanged.

### Checks and results

| Check | Result |
| --- | --- |
| Standalone Git repo, GitHub repo, remote, first push | **defect**: none of the four |
| STATUS.md initialised | validated |
| Visibility / licence defined and justified | **defect**: `undecided`, no LICENSE, public vs Parked/ |
| Names: packageId, packageName, folder, assembly, namespace, Harmony id | validated, consistent (`nelim.tailormade.waistlines`); the junction in RimWorld/Mods points to `Mod/` |
| English docs: README, ATTRIBUTION, CHANGELOG, Mod/ATTRIBUTION.md | validated (Mod/ copy byte-identical to the root one) |
| Build (`dotnet build`, Release, output redirected to scratch) | validated: 0 warnings, 0 errors, and the DLL is **byte-identical** to the shipped one |
| ModIcon.png, Preview.png | **defect**: absent (not generated, nothing generated by this audit) |
| Description in English / source link | **defect**: no `Source code on GitHub` link, no `<url>` |
| Settings: inventory | 3 sliders, 1 checkbox, reset, patch-status line; useful, defaults equal TailorMade's own |
| Settings: MainButtons shortcut | **defect**: absent |
| Settings: in-game behaviour | **unverified** |
| l10n | **defect**: all UI text hardcoded, no Languages/ |
| Dependencies | validated: Harmony (`brrainz.harmony`, 2009463077) and TailorMade (`astryl.tailormade`, 3756915448, checked against its own About.xml, 1.6) declared, `loadAfter` for both. No LoadFolders and no conditional patch, so nothing to reconcile. AB.VPLRF and WDI are not referenced by any code, correctly not declared |
| Scenarios written | validated (TESTING.md, 8) |
| Automated tests | Check-Mod.ps1 22/22 passing, re-run; scope limited to compatibility with TailorMade |
| Pickle tests | **not written**: no `Pickle/` folder or .feature file in the mod or a companion mod, none naming TailorMade in the monorepo. Blocks preTest -> done |
| XML tests | the shipped XML is one MainButtonDef and the language files; Check-Localization.ps1 and scripts/Check-DefInjected.ps1 test them (structure, keys, injection paths). No separate XML suite is needed |
| In-game scenarios, logs | **unverified**; the game was not started by this audit |

### Advanced later the same day: `horsMonoRepo`

At her request, after she chose public visibility and MIT: standalone repository created (`git init -b main`, one commit
`Initialise the repository with the mod folder`, 42 files) and pushed to
https://github.com/vbardales/Rimworld-TailorMade-Waistlines (public, `main`, local and remote at the same commit);
LICENSE (MIT) at the root and in `Mod/`; `.gitattributes`; `Source/Directory.Build.props` sending build intermediates to
`.build/`; `.gitignore` excluding `Parked/`, `Art/` and `_tools/*.xcf`; ATTRIBUTION.md, README.md and CHANGELOG.md
adjusted, Mod/ATTRIBUTION.md re-copied byte-identical; `<url>` and the final `Source code on GitHub` link added to
About.xml (XML parses). Rebuilt with the new props: 0 warnings, 0 errors, DLL byte-identical to the shipped one
(`d96766dd…`). The monorepo `.gitignore` gained `/TailorMadeWaistlines/` (not committed there). Result: all criteria of
`dansMonoRepo -> horsMonoRepo` met, so `workflow_state` is `horsMonoRepo`.

### Settings and localization work, same day

At her request. `TailorMadeWaistlinesMod.cs` now resolves every text through 13 `TailorMadeWaistlines.Settings.*` keys
(`Languages/English/Keyed`, `Languages/French/Keyed`); the settings window scrolls and has slider tooltips and a scope line;
values read from the config file are clamped (`Sanitize`, NaN/infinity to default). New `MainButtonDef`
`TailorMadeWaistlines_Settings`, `buttonVisible` false, worker `MainButtonWorker_TailorMadeWaistlines` opening
`Dialog_ModSettings` on the same mod instance; French `DefInjected/MainButtonDef`. The one remaining literal is the
mod's own name in `SettingsCategory()`, a proper noun. Log messages stay English by rule. Rebuilt (the game was running and
locked the DLL; the copy succeeded on retry, so **the running game still holds the old assembly and needs a restart**).
Tests listed in `automated_tests`. The `settings_audit`, `localization`, `translation_en` and `translation_fr`
values are `complete` on the basis the workflow prescribes for the options and l10n steps: sources, definitions and
automated tests, not in-game observation, which is recorded above as unverified. `workflow_state` stays `horsMonoRepo`:
the steps between (ModIcon, Preview, preOptions) are not met.

### Images, and the state reached: `preTest`

At her request. The two raw generated images she had dropped in `Mod/About/` were moved, unchanged, to `Art/Preview.png` (1402x1122)
and `Art/ModIcon-source.png` (1254x1254). `Art/` is not in the public repository.

- **ModIcon.** The source had a title plate under the mascot, a glow, and a transparent background. It was cropped to the
  mascot and its tape measure (810x810), flattened onto near-black `#0d0b09`, and scaled to 128x128 (28 kB). Seen at 32 px
  (`Art/modicon-32-enlarged.png`): the head, the wink and the tape still read. No text is left; the tape's tick marks carry no
  digits.
- **Preview.** Cropped to 16:9 by `background-position: center 20%`, composed by `Art/render-preview.cjs` (Chrome headless, the
  same method as the other mods) from `Art/preview.html` and `Art/preview-palette.json`. Title "TailorMade Waistlines" at 46 px,
  no prefix, suffix or tag (original public mod), one-line summary, version badge 1.6 read from About.xml. Palette: slate veil
  `#33383F` (sampled on the floor), ink `#F2ECE1` (veil luminance below 0.18), secondary ink a light slate blue taken from the
  dominant family, accent the brick red of the trousers pushed to `#E5502B`; the two are plainly different. Fonts as measured:
  Segoe UI Semibold for the title, Segoe UI elsewhere, no fallback. Contrast on the rendered background without text: title 8.5:1,
  summary 5.6:1 (the first crop, at 27 %, gave 4.496 under the lamp glow and was refused by the script; moving the image down 7 % cleared
  it), badge digits 4.9:1. 896x504, 667 kB. `scripts/Measure-Palette.sh` on the illustration: 4.0 % vivid pixels, 2 hue families. Read at
  268 px: title, rule and badge are identifiable. No face is drawn. The Preview was inspected directly; no comparison with a captured
  game frame was made, and no concrete camera doubt was found.
- `PROMPT_TAILORMADEWAISTLINES.md` was deleted: it has no purpose once both images exist.

### Where the chain stands

Every transition up to `l10n -> preTest` is met on the evidence recorded here: standalone repository, build identical to the
shipped DLL, ModIcon, Preview, English description and final source link, settings and shortcut (sources and automated checks),
English and French coverage, dependencies. One assumption is mine: "developments finished" is read as *the features the README
describes are all there*. The compressed-shirt cropping named in `remaining` is conditional on an in-game observation, not a
promised feature; if she counts it as unfinished, the state drops back to `horsMonoRepo`.

### Next transition

`preTest -> done`: write the Pickle suite (a companion mod under `Tests/Pickle/Mod/`, steps prefixed with this mod's name, buttons
addressed by translation key, waits in frames not ticks while the settings window pauses the game), then have it run and pass. The
suite can be written without the game; running it needs her, since the game is not started by this session.

## Workflow audit — 2026-09-20, second pass

**Result: `preTest`, unchanged.** Previous declared stage: `preTest`. Nothing was
advanced and nothing was rolled back: every transition up to `l10n -> preTest` is met,
and `preTest -> done` is still blocked by the one criterion nobody has filled — the
Pickle suite. What this pass adds is evidence rather than a verdict: the checks the
earlier pass argued from the sources have now been run.

### Audited revision

- Local `main` at `c548d57`; `origin/main` at `fe0baae`, so the last commit is not pushed.
- `Mod/Assemblies/TailorMadeWaistlines.dll`, SHA-256 `EA8644DA…F550`, 11 264 bytes, built
  2026-09-20 19:26:26 — later than every source file, so the shipped assembly is the current one.
- **Local modification, left untouched:** `Mod/Defs/TailorPatternDefs/Pants_Native.xml`, untracked,
  written by another session. Route B: `autoFit false` on `Apparel_Pants` and `Apparel_KidPants`.
  It ships with `Mod/` as it stands and, by its own comment, suspends the pants slider for those two
  garments. Recorded under `remaining`; no judgement is passed on an experiment in progress.
- RimWorld was not started, and `Get-Process RimWorldWin64` was empty before any check was run.
  Nothing here needs the game.

### Checks and results

| Check | Result |
| --- | --- |
| Standalone repo, GitHub remote, first push | validated: `origin` → `vbardales/Rimworld-TailorMade-Waistlines`, `main` tracked, five commits pushed. `c548d57` is local only |
| Visibility, licence, names | validated: public, MIT, `LICENSE` at the root and in `Mod/` byte-identical; `packageId`, folder, assembly, namespace and Harmony id all `nelim.tailormade.waistlines` |
| English docs, `Mod/ATTRIBUTION.md` copy | validated, byte-identical to the root one |
| `.gitignore`, `.gitattributes` | validated: `.build/`, `Source/**/obj`, `bin`, `.vs`, `.idea`, `*.user`; PNG and DLL marked binary |
| Build up to date in the published folder | validated by timestamp and by the test sets loading that DLL |
| `ModIcon.png` | validated by direct inspection: 128×128, 28 290 B. The mascot and the tape read at 32 px |
| `Preview.png` | validated by direct inspection: 896×504, 667 338 B (< 1 MB). Title top-left over a calm area, accent rule plainly distinct from the secondary ink, version badge, near-orthographic overhead, one figure seen from behind, no engraved count |
| Description in English, source link | validated: ends with `[url=https://github.com/vbardales/Rimworld-TailorMade-Waistlines]Source code on GitHub[/url]`, matching `<url>` and the remote |
| Settings (MOD_SETTINGS.md) | validated from the sources and the automated sets: three useful sliders with tooltips, a checkbox, reset, scroll, stated scope and application time, primary access through Mod options, `MainButtonDef` hidden by default opening the same `Dialog_ModSettings`. In-game behaviour belongs to `done -> tested` and stays unverified |
| Localization (TRANSLATIONS.md) | validated: 13 Keyed keys in English and French, DefInjected for the shortcut, no hardcoded sentence outside the mod's own name. The new `TailorPatternDef` carries no player-facing text |
| Dependencies | validated: Harmony and TailorMade declared with `loadAfter` for both, 1.6 only, no LoadFolders, no conditional patch. No visible-pants mod is declared, correctly: any of them will do, so none can be named |
| Automated tests | validated: `Tests/Run-Tests.ps1`, 115 checks in four sets (22 + 40 + 17 + 36), all passing on the DLL above. A falsified expectation and a missing assembly path were both seen reported |
| XML tests | validated, run today over `Mod/`: `Check-XmlFields` 3 files, every element maps to a 1.6 field; `Check-DefInjected` 2 keys, 0 errors; `Check-DefRefs` 2 defs, well-formed, all references resolved; `Check-TypeRefs` no unguarded third-party type |
| Scenarios written | validated: `TESTING.md`, 11 scenarios with preconditions, actions and expected results |
| Pickle tests | **not written**, and their applicability is not justified either. This is the one blocking criterion |
| In-game scenarios, logs, FR/EN display | **unverified**; the game was not started |

### What this pass changes

- The XML criterion of `preTest -> done` was previously argued from the shape of the shipped
  files. It has now been run, on a tree that has since gained a second def — and that def is
  clean.
- `Tests/Check-Logic.ps1` covers what no set covered: the mod's own decisions. The automated-test
  criterion no longer rests on compatibility checks alone.
- Three items were added to `remaining`: the untracked route-B def, the unpushed commit, and the
  publication mentions (AI generation, thanks, adoption clause) that `PUBLISHING.md` asks for in a
  description which is sent once and never again.

### Next transition

`preTest -> done` needs the Pickle suite written, run and green — or a written justification that
it does not apply here, which nothing on file has attempted. Everything else for that transition is
in place. Writing the suite needs no game; running it does, and this session starts none.

**Its scope is small, and AUDIT.md was revised on 2026-09-20 to say why.** Pickle completes the
unit sets rather than replacing them, and costs incomparably more: a run takes the machine — real
clicks, real pointer, the screen occupied — for tens of minutes where `Run-Tests.ps1` takes
seconds. Only what a running game can show belongs in Gherkin; a scenario that repeats what
`Check-Logic.ps1` or `Check-Settings.ps1` already proves is to be deleted, not kept in case. For
this mod that leaves the window in both languages, the RIMMSQOL click, the repaint of pawns already
on the map, persistence across a save and a restart, and the compressed shirt as a `@review`
scenario whose green proves only that the journey ran. The list is in `TESTING.md`. Two operational
notes from the same revision: a run overwrites the previous report, screenshots included, so
anything worth citing is copied out first; and the run lock is taken before any launch.

**And the in-game l10n check is only valid in developer mode.** Outside it, a key missing from the
active language falls back to clean English — indistinguishable from a correct English run, so a
screenshot taken without developer mode is no evidence for the l10n criterion. In developer mode
the game accents that fallback letter by letter (a→à, l→ſ, k→к in Cyrillic); braces survive, so a
raw `{0}` still reads. The complement is what makes it useful to an audit: clean English in the
middle of the French is a string that never went through `Translate` — a hardcoded literal. The
mod's own name in the category header is the one that is meant to look like that. Recorded in
scenario 9 of `TESTING.md`.

## The Pickle suite — one feature, three captures, never run

`Tests/Pickle`, a companion mod (`nelim.tailormade.waistlines.pickletests`) that is never
published. It holds `01-trousers-review.feature`: a colonist stripped, dressed in `Apparel_Pants`
or `Apparel_KidPants`, framed and photographed, three times. It asserts nothing — how a garment
banded into a body drawn without legs reads is a judgement about an image.

**An assertion half existed for an hour on 2026-09-20 and was removed at her request**, the suite
being left to the session that owns the captures. It covered what only a running game can say and
what nothing now covers: which of the two patch routes is live (Mono's inlining of `BandFor` is a
property of the process, so `Check-Logic.ps1` proves what the patch bodies decide and never
whether Harmony got to apply them); the button bar neither drawing the shortcut nor greying it out,
read off `MainButtonWorker`; every settings key resolving in the language actually loaded; the
textures baked against the old band thrown away and the pawns redrawn, counted through
`TexBake.Stats()`; and the settings file written and read back through the game's own Scribe. It is
in the history at `9988515`, built and warning-free, if it is ever wanted back.

**Nothing in it has ever been run**, and `preTest -> done` needs it green, so that criterion is
open exactly as it was.

The three questions that blocked a first run were answered on 2026-09-20 by the session working on
the headless route, and what is checkable from here was checked:

- The extra mods are declared in `Tests/Pickle/wsl-deps.map`, which `scripts/stage-pickle-wsl.sh`
  reads at `$REPO/$MOD/Tests/Pickle/wsl-deps.map` — verified in the script. The shared table no
  longer has to grow.
- The map is a Pickle fixture, not a quickstart: `test-colony.rws` ships with Pickle and is on
  disk in the Workshop copy — checked. Nothing to stage, nothing to declare.
- Headless captures render for real, 1920x1080 under Xvfb, as reported by that session. Which is
  why no blank-capture guard was written; if one is ever needed it reads the attachment back and
  refuses a file that is trivially small or one flat colour, because a step that captured nothing
  does not fail on its own.

**Route B still changes what a capture means, and nothing in the report says so any more.** While
`Mod/Defs/TailorPatternDefs/Pants_Native.xml` is in place, `autoFit false` bypasses the band for
`Apparel_Pants` and `Apparel_KidPants` — exactly the defs the captures dress the pawn in. The step
that attached which fitting had actually claimed the garment went with the assembly, so the only
thing telling a band run from a route-B run is the memory of which run produced it. Write it down
beside the images when copying a report out; five runs later the archive is gone.

**Briefly broken by the removal, fixed the same minute** (`e75e536`). `01` had taken
`the fitting that claims {string} is recorded` from the deleted assembly, and would have failed at
startup on an undefined step; the session that owns the feature took the three lines out and
rewrote its header. Twelve steps remain, every one of them vanilla, so the suite needs no build
and no DLL — which is what it was designed to be before the two halves briefly met.

The header now carries the cost where a reader of the feature will meet it, not only here: nothing
in the images says which fitting produced them, and with `Pants_Native.xml` in place both garments
it dresses have `autoFit false`, so those are captures of route B rather than of the mod. If the
labelling is ever wanted back it does not need the whole assembly — one step reading
`PatternRegistry.Resolve` is enough, and `9988515` has it.
