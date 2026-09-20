---
mod:          TailorMade Waistlines
packageId:    nelim.tailormade.waistlines
repo:
visibility:   public
detached:     no
stage:        port
workflow_state: dansMonoRepo
workflow_audited: 2026-09-20
localization: partial
translation_en: partial
translation_fr: partial
settings_audit: partial
dependencies_audit: complete
licence:      undecided
licence_at:   "Mod/ is publishable: one assembly of our own, patching TailorMade, which is MIT. Parked/ is not, and never ships - its textures are computed from General Textures Collection (3789119336) and WDI's Realistic Bodies (3527486510), neither of which grants a licence. Steam uploads Mod/ only, which is the safeguard. See ATTRIBUTION.md."
dependencies: "brrainz.harmony and astryl.tailormade, both required. A mod that gives leg garments a worn graphic at all, since vanilla trousers carry none - tested with AB.VPLRF. A body retexture drawn without legs is the reason the mod exists, tested with wdi.realistic.bodies, but nothing in the code names it."
original:     none
showcase:     Art/waist_{Male,Female}.png, generated contact sheets (not a Preview.png yet)
tested_on:
workshop:
automated_tests: "Tests/Check-Mod.ps1, 22 checks, re-run by the 2026-09-20 audit: all passing. They are reflection checks over TailorMade's assembly, not tests of this mod's settings logic. No Pickle suite, no XML tests (no XML shipped)."
manual_scenarios: "TESTING.md, 8 scenarios, none run"
remaining:
  - "defect (audit 2026-09-20, dansMonoRepo -> horsMonoRepo): the folder is not a Git repository of its own and is untracked ('??') in the monorepo; no GitHub repository exists (gh repo list vbardales, 143 repositories, none named after this mod); `repo:` is empty; no first commit pushed."
  - "defect (dansMonoRepo -> horsMonoRepo): licence is `undecided`, which is not one of open/alive/forbidden/silent/original; there is no LICENSE file at the root or in Mod/. Visibility says public while the working folder holds Parked/ and Art/Gimp/, which derive from unlicensed art: they cannot go into a public repository."
  - "defect (dansMonoRepo -> horsMonoRepo): no .gitattributes; ATTRIBUTION.md claims AB's Visible Pants is 'named in loadAfter', which About.xml does not do."
  - "defect (later gates, recorded so they are not lost): Mod/About/ModIcon.png and Mod/About/Preview.png do not exist; Art/Preview.png neither; the Art/waist_*.png contact sheets named in `showcase` are not a Preview. About.xml has no <url> and its description does not end with [url=...]Source code on GitHub[/url]."
  - "defect (options / l10n): every player-facing string in the settings window is a hardcoded English literal in Source/TailorMadeWaistlines/TailorMadeWaistlinesMod.cs (SettingsCategory, intro label, three slider labels, checkbox label and tooltip, reset button, two status lines). Mod/Languages/ does not exist. `localization: none needed` was wrong."
  - "defect (options): the mod has useful settings but declares no MainButtonDef and no Defs at all, so the hidden MainButtons shortcut required by MOD_SETTINGS.md is absent. `settings_audit: complete` was not supported by the sources."
  - "unverified (options): no setting has been changed in game, no settings file has been written, and the defaults, persistence, reset, clamping and the ClearAndRepaint refresh have never been exercised. Player.log (last written 2026-09-20 14:42) predates the rename and the current DLL and contains no line from this mod, so it is not evidence for the shipped build."
  - "unverified (done -> tested): all 8 scenarios of TESTING.md, FR and EN display, RIMMSQOL shortcut."
  - "renamed on 2026-09-20, before anyone had it: TailorMade Waistlines, packageId nelim.tailormade.waistlines, folder TailorMadeWaistlines, assembly TailorMadeWaistlines.dll, namespace TailorMadeWaistlines, Harmony id nelim.tailormade.waistlines. The junction at RimWorld/Mods was repointed and her ModsConfig line was rewritten in place (backup: ModsConfig.xml.before-rename). Renaming a packageId costs nothing only while the mod has never been published - that window is now closed."
  - "the plan, hers: two modules above TailorMade. This one is the engine and names no body mod. A second, TailorMade Waistlines for WDI Realistic Bodies, carries the values. For the split to be worth its cost the preset must be pure XML, so the engine has to define a def type - targetBodyMod plus a value per body type - and apply the preset whose target mod is loaded, with the sliders as the manual override."
  - "per body type is the missing piece, and it is measured: within WDI alone the navel runs from 0.46 on Fat to 0.58 on Thin, so one slider is already a compromise over nine bodies. BandFor only receives the apparel class. Graphic_TailorMade.Init calls PatternRegistry.ResolveFor(race, bodyType, layer, ...) before it calls BandFor, so a postfix on ResolveFor can hold the resolved body type for our BandFor postfix to read. TailorMade keys its texture cache on the body mask instance, so two body types cannot collide. Not written."
  - "dead end, measured 2026-09-20 by _tools/measure-waist-anchor.js: deriving the waistline from the body art at run time does not work. The geometric anchor - narrowest row of the lower silhouette - hits the search bounds on most bodies (WDI Male 0.22, Hulk 0.21, Fat 0.66) because those silhouettes never stop narrowing; and the navel detector returns nonsense on other mods (0.20 on ScrubDaddy Female). Neither repere survives a change of body mod. The values have to be authored, which is exactly what the preset module is for."
  - "before a release: choose a licence (MIT would match what it patches), draw a Preview.png and a ModIcon.png, and decide whether the repository is public too - if it is, Parked/ cannot come with it."
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
  - "later: the repository. The folder is not in git at all - her call on 2026-09-20 was to leave that until the mod has taken its shape."
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
| Pickle, XML tests | not written; XML is not applicable (no XML shipped), Pickle applicability not yet justified |
| In-game scenarios, logs | **unverified**; the game was not started by this audit |

### Next transition

`dansMonoRepo -> horsMonoRepo`: create the standalone repo and the GitHub repository, push a
first commit, choose the licence and write LICENSE (root and Mod/), settle the visibility
question with Parked/ and Art/Gimp/ kept out of any public repository, add `.gitattributes`.
