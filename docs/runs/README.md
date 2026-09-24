# Pickle runs

One line per run. Reports and screenshots live under `docs/runs/*/evidence/`, ignored by git, and
only the latest one for the build now in the repository is kept; an older one stays only if it is
the sole proof of a check the latest did not repeat.

- 2026-09-21 09:03, `01-trousers-review`, mod DLL `EA8644DA…`, WSL: 3/3 passed, `exitReason passed`, and all three captures showed a pawn hauling its trousers, not wearing them (the `is wearing` barrier passed anyway; AB was inert without a seeded settings file). Green and worth nothing. Superseded by the trouser art (DLL `F624927E…`), evidence deleted 2026-09-23.
- 2026-09-24 11:03, pass `wdi-ab-general`, DLL `7FD0FEBF…`, WSL: `exitReason failed`, 28 scenarios (28 discovered across 4 features), 11 passed, 10 failed, 7 skipped. **All 11 passes are `01` and `02`; all 10 failures are `03-silhouettes` on an undefined step** (`{string} body type is {word}`, Pickle PR #32, not released), not on the mod; the 7 skips are `04`, XND-only, as designed. The pawn is now drafted and stationary ("Watching for targets", Gear tab lists `Cloth pants (normal)` under Apparel, Inventory empty): the wear barrier holds. The mod log confirms the direct patch route, "1 more garment shares the trouser art" (the review's first fix firing on a real def) and "18 textures read from General, 3 drawn onto AB's plain shells". The pawn is ~45 px tall: **nobody has judged how the trousers read.** Evidence trimmed to `evidence/kept/` (0.13 MB of 154).
