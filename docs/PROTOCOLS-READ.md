# Protocols read

Which protocol documents this mod's session has read, at which version, and which ones were not worth
reading, so a later session (or this one after a compaction) does not re-read what has not moved.
The version of a file is the last commit that touched it (`git log -1 --format='%h %ad' -- <file>`).
"clean" means `git status --short -- <file>` printed nothing.

## Read on 2026-09-25 (after a compaction, at the owner's request)

Monorepo `rimworld` at `99d91bba`. All files read in full, except where the last column says otherwise.

| File | Version read | Working copy | Useful to this mod? |
| --- | --- | --- | --- |
| `AGENTS.md` | `90d51374` (09-25 15:25) | clean | **Yes, keep.** Evidence rules (one text line per run in `docs/runs/`), publish by CI, settings/translation gates |
| `AUDIT.md` | `90d51374` (09-25 15:25) | clean | **Yes, keep.** Stage criteria, `done → tested` rules, fail fast (2026-09-25), Pickle traps, session title. Re-read when it moves: it changes several times a day |
| `PUBLISHING.md` | `90d51374` (09-25 15:25) | clean | **Yes, at `prepublished`.** Description order and headings, THANKS rules (PickleTools, every integration), `PUBLICATION.md`, images folder. Skip the "Pièges d'outillage" git-history section unless committing in the monorepo |
| `TRANSLATIONS.md` | `90d51374` (09-25 15:25) | clean | **Done, not needed again** unless player-facing text or Defs change: `localization`, `translation_en`, `translation_fr` are `complete` in `STATUS.md` |
| `STYLE_RIMWORLD.md` | `90d51374` (09-25 15:25) | clean | **No.** Prompts and overlay palette for Preview and ModIcon; the owner generates both and this mod has them. Re-read only if `Mod/About/Preview.png` is redone |
| `scripts/SEARCHING.md` | `90d51374` (09-25 15:25) | clean | **No**, unless the Workshop corpus has to be searched (then use `scripts/Search-Workshop.sh`, never `grep -r`). Not needed for the WDI Exosuit / Body Traits check: those two are looked at one folder at a time |
| `PickleTools/README.md` | `43c3753` (09-25 15:16) | clean | **Yes.** The table of tools: `ColonistRace` (body type step, used by `03`), `InspectTabs` (used by `02`), `TextureOwner`, `HoverSteps`, `KeyedClick`, `InterfaceScale` (not wired) |
| `PickleTools/Headless/README.md` | `b2712fc` (09-25 15:03) | clean | **Partly.** Useful: filter terms, `wsl-ids.map`, settings seeds, one mod several passes, `-DepMap`, evidence. **Skip** the machine internals (lock, queue, reservation, sleep freeze, orphan games, the two views of AppData): the dispatcher owns them |
| `Docs/steps.md` (RimWorks/Rimworld-Pickle `main`) | fetched with `gh api` 2026-09-25, no commit id (the lookup failed); the dispatcher read `e101e2d` | external repository | **Yes, when writing a step.** It confirms the released Pickle has no body type step, no texture-path read; gender, age, gear, `apparel covers` yes |
| `Rimworld-Release-Admin/docs/OPERATIONS.md` | `2ce34a3` (09-25 13:28) | clean | **At publish only.** Dry-run then `publish` with the full SHA, only the owner approves `steam-production`, the gallery is manual. The credentials and Codespace sections are not for a mod session |
| `Rimworld-Ticket-Dispatcher/docs/WELCOME.md` | `4130d70` (09-25 15:29) | **modified, not committed** | **Yes, keep.** Ticket sizing, filter terms, no watcher, no SHA in a request (freeze the tree), point 5: read and record versions |
| `Rimworld-Ticket-Dispatcher/docs/SUBMIT.md` | none | **untracked** | **Yes.** Every option of `Submit-PickleRun.ps1` and the launcher exit codes. `-DepMap` takes a bare file name (looked up in the mod's `Tests/Pickle/`) or a **full** path; a relative path with a separator is used as is and finds nothing |
| `STATUS.md` | `4d5dd53` (09-25 13:02) | clean | mine, kept up to date |
| `README.md` | `9318053` (09-21 21:54) | clean | mine; **stale**, see below |
| `CHANGELOG.md` | `18e2bf2` (09-23 18:55) | clean | mine, `0.1.0` only, no code change since |
| `ATTRIBUTION.md` | `c315ec8` (09-21 19:57) | clean | mine; the copy in `Mod/` has the same SHA-256 (`C7D01791…CC68`), so the two agree |
| `LICENSE` | `7c17640` (09-20 18:50) | clean | mine; the copy in `Mod/` has the same SHA-256 |
| `PUBLICATION.md` | | | **does not exist** in this repository |
| `BACKLOG.md`, `NOTES.md`, `BUGS.md` | | | **do not exist** in this repository (the monorepo's `BACKLOG.md` was not read, as asked) |
| `TESTING.md` | `4d5dd53` (09-25 13:02) | clean | mine |
| `docs/runs/README.md` | `23dbbbb` (09-24 20:48) | clean | mine; one line per run, the two exploration runs of 09-25 are not in it (they wrote no report) |
| `Tests/Pickle/README.md` | `4d5dd53` (09-25 13:02) | clean | mine |
| `Mod/About/About.xml` | `130d841` (09-21 21:23) | clean | mine; **behind the rules**, see below |

Also read for the same reason: `Rimworld-Ticket-Dispatcher/docs/DOCS_READ.md`, the dispatcher's own record and the model of this file.

## What in these documents applies to this mod and is not done

Each is pending work, not a failure of the mod as shipped.

1. **`PUBLICATION.md` is missing.** `AUDIT.md` (`tested → prepublished`) and `PUBLISHING.md` require it: the
   order of the gallery images and what each shows, the thank-you comments for the mods drawn on, dependencies and
   DLC, the adult-content answer, and the change note for the Steam upload. Nothing in it can be written honestly
   before the captures have been looked at.
2. **The description does not follow the required order and headings.** `AUDIT.md` step 10 wants, after the body:
   `IF I GO QUIET` (adoption clause verbatim), `AI-GENERATED` (which tool did what), `THANKS`, the line pointing to
   `ATTRIBUTION.md` and the licence, then the source link. `About.xml` has `Thanks`, `Made with AI`, `Adoption`, no
   attribution line, and no Workshop link on the names of the mods cited. The item (3806769245) already exists, so
   `SetItemDescription` will not send a corrected text: it is corrected by hand on the Steam page.
3. **Thanks are incomplete.** `PUBLISHING.md` asks to thank every integration named or exercised, and to name the
   development tools: **Pickle, RimLogging and PickleTools** (private Workshop item `3806142401`, "development
   only, never a dependency"), since two pass maps stage `nelim.pickletools.inspecttabs` and
   `nelim.pickletools.colonistrace`. Also **XeoNovaDan's Visible Pants** (its own pass), and the author of WDI's
   Realistic Bodies, by name, which is waiting for the owner's wording. `WORKSHOP_COMMENTS.md` is the registry that
   says whether a thank-you comment is still to post; it has not been read for this mod.
4. **`README.md` is stale**: it says `Check-Mod.ps1` has 22 checks (it has 30), lists five test sets without the
   Pickle suite, and has no development-tools credit.
5. **`STATUS.md` front matter `automated_tests`** still says the Pickle features were "never run since the trouser art
   landed"; all six passes ran on 2026-09-24. To correct the next time the front matter is touched.
6. **`ATTRIBUTION.md`** names neither Visible Pants by XeoNovaDan (exercised by two passes) nor PickleTools.
7. **Rules that changed my practice today**: fail fast applies to the `1.0.0` too, but no red scenario may stay
   without a green replay; a `-DepMap` is a bare file name; a request carries no SHA, so the tree stays frozen
   until `RUN_DONE`; the mod session titles itself `TailorMade Waistlines / <stage>` and only when `STATUS.md`
   changes.
