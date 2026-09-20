using HarmonyLib;
using RimWorld;
using TailorMade;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// Lets a full-body shirt be treated as a chest piece, so the chest band
    /// applies to it.
    ///
    /// TailorMade will only band a torso garment once <c>ConfirmChestArt</c>
    /// has measured the art and found that it starts at least 40% of the way
    /// up the texture. Its author says plainly what that test is for, in the
    /// tooltip of the setting it guards:
    ///
    ///   "Only kicks in when the worn texture is actually torso-only; long
    ///    coats and capes that drape down the body are left full-body."
    ///
    /// Which is right, and is the reason this option cannot simply lift the
    /// test. A vanilla shirt is drawn over the whole body, so it fails the
    /// measurement and stays full length, hiding the trousers whatever the
    /// trousers do — but so is a duster, and a duster is *supposed* to reach
    /// the ankles.
    ///
    /// The layer separates them, and vanilla is consistent about it: shirts
    /// and tribalwear are OnSkin, while dusters, parkas, jackets and robes are
    /// Shell. So the test is lifted for on-skin garments only. A coat still
    /// drapes, and astryl's guard still does the job he wrote it for.
    /// </summary>
    public static class ChestArt
    {
        [HarmonyPatch(typeof(ApparelClassifier), nameof(ApparelClassifier.ConfirmChestArt))]
        public static class ConfirmChestArt_Patch
        {
            public static void Postfix(ThingDef def, ref bool __result)
            {
                if (__result) return;
                if (!TailorMadeWaistlinesMod.Settings.shortenShirts) return;
                if (def?.apparel == null) return;
                if (def.apparel.LastLayer != ApparelLayerDefOf.OnSkin) return;
                __result = true;
            }
        }
    }
}
