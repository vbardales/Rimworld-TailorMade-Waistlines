# Use cases and backlog

What the mod has to look right on, per body (Male, Female, Thin, Thin female, Fat, Fat female, Hulk, Hulk female, Child) and
per pass. A case is done when its captures were opened and read, not when the run is green.

## Covered by the gallery pass (`05-gallery.feature`, "ten bodies, four outfits")

| Case | State |
|---|---|
| T-shirt, no trousers | cut on the underwear's top edge; read |
| Bare torso, trousers | trousers start on the underwear's top edge; adult-content question open (PUBLICATION.md) |
| T-shirt and trousers | shirt runs 0.03 under the trousers' top edge; Female and Thin female were showing belly skin |
| Jacket on a bare torso | stretched to the trousers' hem; judged ugly (stair-stepped, artificially stretched); to replace by a THIGAPPE-style mask, no stretch |

## Covered by the legwear pass (`06-legwear.feature`)

Shorts (gap between the legs left open), skirt (nothing black under it). Not in the gallery yet.

## To add

- **Dress** (torso and legs in one garment): left alone by the cut; needs its own capture on every body.
- **Long coat and robe:** must keep draping; the mask must not shorten them.
- **Croptop** (Simple Pants and Shirts) and a short top: must never be lengthened, only cut.
- **Stockings and tights:** a layer on the legs, under trousers and skirts. Needs a mod that adds them; to find.
- **High heels:** change the foot and the leg line. Needs a heels mod (Workshop "high-heels" was seen on LoversLab, not checked); to find.
- **"Realistic" clothing:** garments drawn for a realistic body (WDI's own apparel folders: Blouse, CasualTShirt, ChefsUniform,
  Jumpsuit, MilitaryUniform, Scrubs, SheriffShirt, ShirtFleece, ShirtandTie, TankTop, Tunic, BodyStrap, CorsetRoyal, EltexShirt,
  ShirtBasic, ShirtButton, TribalA, dress, VestRoyal). Native art is now cut as it is for shirts; each of these needs a capture.
- **Other types found in the clothing libraries** (Smaller Shirt Textures, Simple Pants and Shirts, Useless clothes, Xeva Body Pants,
  retextures of visible pants, female variants for fat bodies): one capture each per body once the cut works for them.
- **Children:** no WDI underwear; the cut line is the one the child's trousers start on. Needs a child in a dress, a jacket and shorts.
- **Later (expansion):** pregnancy belly, breasts, penises, body hair; the cut line stays replaceable
  (`ShirtCut.CutFraction`, `ShirtCut.LineFor`).

## Mods the Sanctuary needs for these passes

TailorMade, WDI's Realistic Bodies, Female Body Variants Continued, Female Apparel Variants Continued, AB's Visible Pants, and this mod.
Female Body Variants must load before WDI (its own `Naked_*_Female` files are copies of the base bodies and would shadow WDI's),
TailorMade after the body mods (`last:astryl.tailormade` in the pass map).

## Clothing libraries to test (given by Virginie, read from the installed Workshop folders, not yet captured)

- **ZX's Apparel for [NL] Realistic Body**, Workshop 3604442772, `zx.apparel.realisticbody`, needs `Nals.RealisticBody` ([NL] Realistic Body)
  and Harmony. About 25 garments with art for Fat, Female, Hulk, Male and Thin in three facings (Gothicdress, Gowndress, Hoodie,
  Maiddress...). The art is drawn for [NL]'s bodies, not WDI's: to see what the cut does on them, and whether they belong in the
  WDI passes at all (to find).
- **UNAGI Royalty Apparel**, Workshop 3352990362, `UNAGI.Ap.Dress`: Royalty noble dresses and clothes (about 12 apparel defs plus
  headgear; folders `UNARoyalDress`, `UNA_Dress_sitagi`, `UNA_RoyalRobe`...). Given for Compatible Body 2, Erin's and Unagi's bodies.
  Dresses: to capture on every body, as in "Dress" above.
- **[IMO] Default Apparel Retexture** (Sato Imozou), Workshop 2660249018, `SatoImozou.IMOZOUapparel`: retextures vanilla apparel
  (258 images under `Things/Pawn/Humanlike/Apparel`). Given for Imozou's bodies. To capture on every body, with and without the cut.
- **Chibi Body**, Workshop 2187064189: given by Virginie, not installed here, not read yet.
- **Ratkin Apparel+ (unofficial)** (PPONN), Workshop 3247891238, `PPONN.RatkinApparel`, needs Humanoid Alien Races and Harmony: apparel
  for Ratkin, 70 images. A race of its own, so a body of its own: to find out whether the cut and the trousers mean anything there.
- **Not read, not installed here:** Chibi Body 2187064189 and "abc" 3459200778. Steam answered 429 to the page fetch.
- **UNAGI family** (Virginie: "à noter"). Installed here, read by name only: UNAGI Vanilla Apparel 3245977854 (`UNAGI.apparel.B.Zibunyou`),
  Mini MOD SimpleSuit 3253298952 (`UNAGI.suit.SET`), Winter clothing 3266399912 (`UNAGI.huyuhuku.SET`), Japanese Assortment 3297676809
  (`UNAGI.Wahuu.hako`), Battle Coat 3301577366 (`UNAGI.Battle.coat`), CAFE 3325530853 (`UNAGI.Cafe.gohan`), Royalty Apparel 3352990362,
  and Apparel APP Extension 3379688555 (`InternSeraph.UNAAPPExt`, by another author: it reads as a patch for the APP/THIGAPPE pattern
  system, to check). **"Unagi coat" 3253300748, given by Virginie, is not installed here: not read.** Coats are the cases where the
  cut must leave the garment long; each needs a capture.
- **ATH's Retexture Female Apparel** (Anthitei), Workshop 3145326932, `Anthitei.ATHsRetextureFemalApparel.Retexture`: retextures women's
  versions of vanilla apparel (Apron, Blouse, Cape, CasualTShirt, Hoodie, Overalls, PeltCoat, SheriffShirt, ShirtFleece, ShirtandTie,
  TankTop, TribalKilt, TribalPoncho, Tunic; 116 images). Given by Virginie for "compatible" bodies. To capture on the female bodies,
  with and without the cut.
- **[SS]Maid Project** (BJInternetSupervision), Workshop 1498756997, `BBIS.MaidProject`, 1.6 supported, 437 images, no body textures
  (apparel and buildings only). Given by Virginie as "female BB": maid outfits, dresses and aprons; to capture on the female bodies.
