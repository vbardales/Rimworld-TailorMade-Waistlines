using System;
using HarmonyLib;
using TailorMade;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// The bands TailorMade stretches a garment into, made adjustable.
    ///
    /// TailorMade classifies apparel and fits each class into a horizontal
    /// band of the body's alpha bounds - 0 at the hem, 1 at the top. In
    /// <c>TexBake.BakeFitted</c> the target rectangle is
    /// <c>AlphaBoundsUVInBand(body, band.x, band.y)</c>, so the band's edges
    /// are literally where the garment's edges land.
    ///
    /// Its values are constants chosen for a body with legs: pants reach to
    /// 0.58. On a body retexture drawn without legs, 58% of the way up from
    /// the hem is above the navel, and trousers read as a high-waisted skirt.
    /// Nothing in TailorMade exposes those numbers, so this moves them.
    /// </summary>
    public static class Bands
    {
        // What TailorMade itself uses. Kept here so a fallback can recognise
        // an untouched value, and so the settings can be reset to it.
        public static readonly Vector2 StockBoots = new Vector2(0f, 0.2f);
        public static readonly Vector2 StockPants = new Vector2(0f, 0.58f);
        public static readonly Vector2 StockChest = new Vector2(0.45f, 1f);

        /// <summary>True once the direct patch is known to take effect.</summary>
        public static bool DirectPatchWorks;

        public static Vector2 For(ApparelClass cls)
        {
            var s = TailorMadeWaistlinesMod.Settings;
            switch (cls)
            {
                case ApparelClass.Boots: return new Vector2(0f, s.bootsTop);
                case ApparelClass.Pants: return new Vector2(0f, s.pantsTop);
                case ApparelClass.Chest: return new Vector2(s.chestBottom, 1f);
                default: return new Vector2(0f, 1f);
            }
        }

        private static bool Same(Vector2 a, Vector2 b) =>
            Mathf.Abs(a.x - b.x) < 0.0005f && Mathf.Abs(a.y - b.y) < 0.0005f;

        /// <summary>
        /// The one place the band is decided. Patching here is worth more than
        /// patching where it is used: TailorMade builds its texture cache key
        /// from the band's value, so a band changed at the source invalidates
        /// the cache by itself and no stale texture survives.
        /// </summary>
        [HarmonyPatch(typeof(ApparelClassifier), nameof(ApparelClassifier.BandFor))]
        public static class BandFor_Patch
        {
            public static void Postfix(ApparelClass cls, ref Vector2 __result)
            {
                __result = For(cls);
            }
        }

        /// <summary>
        /// The safety net. <c>BandFor</c> is a small static method returning a
        /// switch over static fields, which Mono may inline into its caller -
        /// and an inlined method is one Harmony has nothing left to patch. So
        /// the band is corrected again where it arrives, in a method far too
        /// large to be inlined.
        ///
        /// It rewrites a band only while it still holds the stock value, so
        /// when the patch above did work this does nothing at all.
        /// </summary>
        [HarmonyPatch(typeof(TexBake), nameof(TexBake.BakeFitted))]
        public static class BakeFitted_Patch
        {
            public static void Prefix(ref Vector2 fitBand)
            {
                if (DirectPatchWorks) return;
                if (Same(fitBand, StockPants)) fitBand = For(ApparelClass.Pants);
                else if (Same(fitBand, StockBoots)) fitBand = For(ApparelClass.Boots);
                else if (Same(fitBand, StockChest)) fitBand = For(ApparelClass.Chest);
            }
        }

        /// <summary>
        /// Asks TailorMade for a band and sees whether our answer came back.
        /// Run once at startup, with the settings temporarily off their
        /// defaults so the two values cannot coincide.
        /// </summary>
        public static void SelfTest()
        {
            var s = TailorMadeWaistlinesMod.Settings;
            float keep = s.pantsTop;
            try
            {
                s.pantsTop = 0.33f;
                DirectPatchWorks = Mathf.Abs(ApparelClassifier.BandFor(ApparelClass.Pants).y - 0.33f) < 0.0005f;
            }
            catch (Exception e)
            {
                DirectPatchWorks = false;
                Log.Warning("[TailorMade Waistlines] could not test the band patch: " + e.Message);
            }
            finally
            {
                s.pantsTop = keep;
            }

            Log.Message(DirectPatchWorks
                ? "[TailorMade Waistlines] band patch active on ApparelClassifier.BandFor."
                : "[TailorMade Waistlines] ApparelClassifier.BandFor looks inlined; falling back to "
                  + "TexBake.BakeFitted. Bands still move, but a change to the sliders needs a "
                  + "restart to clear TailorMade's texture cache.");
        }
    }
}
