# Publication notes

What the Workshop page needs and the repository holds nowhere else (`PUBLISHING.md`, `AUDIT.md` step
`tested → prepublished`). It serves twice: at the first upload, and for whoever takes the mod over.

**State, 2026-09-25: incomplete, on purpose.** The item exists (`3806769245`, prepublished 0.1.0, private).
The sections below say what is decided and what is not. Nothing here is filled in to look finished.

## 1. Description

The live description is the one sent when the item was created (`SetItemDescription` is called once). It is
`Mod/About/About.xml`'s at that commit and is corrected by hand on the Steam page. What still differs from
`AUDIT.md`'s required order (body, `IF I GO QUIET`, `AI-GENERATED`, `THANKS`, the line pointing to
`ATTRIBUTION.md` and the licence, then the source link), to fix on the page:

- the three closing paragraphs are titled `Thanks`, `Made with AI`, `Adoption`, not the required headings;
- there is no line pointing to `ATTRIBUTION.md` and the licence;
- the mods it names have no Workshop link on their names;
- the thanks miss the development tools (Pickle, RimLogging, PickleTools, development only, never a
  dependency) and XeoNovaDan's Visible Pants, which has a pass of its own.

**Coming standard, not adopted yet** (CI/CD setup, 2026-09-25, `Rimworld-Release-Admin` `f196148`, nothing forced): the
description is written once, in Markdown, in a fenced block under `## Steam description` of this file; the CI
converts it to BBCode and generates `About.xml`'s `<description>` from it, and every dry-run and publish stops if
the two differ. To adopt at the next publication or when Virginie asks, through the CI/CD session (this repository
has no publish workflow of its own to regenerate yet). Until then the text above is the working list.

The thanks sentence for the authors of WDI's Realistic Bodies, approved by Virginie on 2026-09-25, to put in
`THANKS`:

```
and to Windonsi and Starkz, whose [url=https://steamcommunity.com/sharedfiles/filedetails/?id=3527486510]WDI's Realistic Bodies[/url] draws bodies without legs, which is the reason this mod exists at all, and the bodies every test of it is played on.
```

## 2. Gallery, in upload order

**Not decided.** The order is arranged by what each image shows, and no capture of the trousers has been
looked at yet: the pawn is about 45 px tall in a 1080p frame in every capture so far, and the last one had
the hover tooltip over the legs. Steam shows the first image large; it must be the most demonstrative, not the
prettiest. To fill in once the framing is fixed and the images are opened.

## 3. Thank-you comments

One main comment per recipient page for the whole collection: `WORKSHOP_COMMENTS.md` (monorepo) decides
whether one is still to post. To post after the item is public, since a link to a private item opens for
nobody.

| Workshop ID | Recipient | State here | Registry row |
| --- | --- | --- | --- |
| `3527486510` | Windonsi and Starkz, WDI's Realistic Bodies | **drafted** (approved 2026-09-25) | none yet: a `drafted` row is to add to the register, which is Virginie's file |
| `3756915448` | astryl, TailorMade | not drafted | not looked up |
| `2986402536` | aedbia, AB's Visible Pants | not drafted | not looked up |
| `3789119336` | Kas, General Textures Collection | not drafted | not looked up |
| `2264108215` | XeoNovaDan, Visible Pants (has a pass of its own) | not drafted | not looked up |

Draft for `3527486510`, 628 characters (limit 1000), BBCode-safe, the bare link at the end makes a thumbnail:

```
Hi Windonsi and Starkz! 😊 Thank you for WDI's Realistic Bodies. It is the reason a small mod of mine exists: your bodies are drawn as one smooth shape with no legs, and looking at them closely showed me that TailorMade puts trousers a little too high on that kind of body. So I wrote TailorMade Waistlines, a few sliders that decide where trousers, boots and shirts stop. I built it and tested it on your bodies, and nothing of yours is copied or redistributed. ✨ It works with any body art, but yours is what it grew up on. Thank you for the beautiful work! 💛
https://steamcommunity.com/sharedfiles/filedetails/?id=3806769245
```

The drafts for the others are to write, personalised, one each: the same text pasted four times shows.

## 4. Dependencies and DLC

Read from `Mod/About/About.xml` on 2026-09-25; the sources were checked in the 2026-09-21 audit and not reopened for this note:

- **Hard:** Harmony, and TailorMade (`astryl.tailormade`): the mod is Harmony patches on its internals.
- **`loadAfter`, not dependencies:** AB's Visible Pants and General Textures Collection. The trouser step acts
  only where AB is active; without either, nothing is drawn or registered.
- **DLC:** none declared. The child garment (`Apparel_KidPants`) is Biotech's; the mod does not require Biotech.
  Not re-verified against the `LoadFolders`/`IfModActive` branches of the dependencies.

## 5. Content warnings

The adult-content boxes: **not answered.** The mod ships no image of a person beyond its own preview and icon,
and neither has been reopened for this question. To answer with the images open.

## 6. Steam change note

**Not written.** It is written at the moment of upload, in a tab nothing asks for until the form is open. The
0.1.0 upload only created the item. The `1.0.0` note will say what the mod does now: the three band sliders, the
shirt option, the trouser art from General's retexture and the drawn details, the two drop sliders, and that
every trouser texture is read at run time and none is shipped.

## 7. Before any `publish`

Fail fast applies (`AUDIT.md`, 2026-09-25), and none of it is skipped: no red scenario without a green replay
(today `03-silhouettes` has two red children, waiting on a PickleTools step), the gallery, Virginie's manual
validations, a dry-run of the exact commit, `publish` with the full SHA, and Virginie's approval of
`steam-production`. The rollback target is chosen before, not after.
