# Pickle run, 2026-09-21 09:03

**Green, and worth nothing.** 3 scenarios passed, 0 failed, 0 skipped, `exitReason: passed`, and all
three captures show a pawn hauling its trousers to a stockpile instead of wearing them.

## What was run

- Suite `TailorMade Waistlines - Pickle tests`, feature `01-trousers-review`, through
  `scripts/Run-PickleWsl.ps1 -Mod TailorMadeWaistlines` in the WSL install, under Xvfb.
- Build: the suite as of `cfb9354` (the `is wearing` barrier already in), before the trouser art
  existed. Mod DLL SHA-256 `EA8644DA…F550`.
- One feature, three scenarios: nothing was silently deselected.

| Scenario | Outcome | Duration |
| --- | --- | --- |
| a male colonist wearing nothing but trousers | Passed | 14 635 ms |
| a female colonist wearing nothing but trousers | Passed | 1 276 ms |
| the child garment, which is a different def | Passed | 1 953 ms |

## What the images showed

- **Male:** the inspector reads `Carrying: Synthread pants (normal)`, `Hauling synthread pants
  (normal) to Stockpile zone 1`, `Queued: Wearing synthread pants (normal)`. The garment is in his
  hands and the wear job is still queued.
- **Female:** she carries a synthread *button-down shirt* to a stockpile while the trousers lie on
  the ground a few tiles away, left over from the previous scenario under `@same-world`. 1 276 ms is
  far too fast for anything to have been worn.
- The interface is fully drawn (colonist bar, inspector, architect bar in frame) and the camera is
  far enough out that a pawn is about forty pixels tall.

## Why it was green

The `is wearing` barrier passed while the garment was carried. Separately, and found the same
morning, AB's Visible Pants is inert on a profile with no settings file, so every headless pass had
AB installed and assigning no texture: a pawn is drawn bare whatever it wears.

## Where the evidence is

`evidence/` beside this file, on disk and ignored by git: `summary.md`, `summary.json`,
`junit.xml`, `Player.log` and the three PNGs. Pickle overwrites its report folder at every run, so
this copy is the only one. If it is lost, this text is what remains, and it is testimony, not proof.
