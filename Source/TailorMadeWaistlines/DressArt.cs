using System.Collections.Generic;
using RimWorld;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// Keeps TailorMade's hands off a garment that covers torso and legs (a dress, a robe, a coat to the ankles) when its mod
    /// drew it for the body: <c>UNARoyalDress_Fat_south</c> exists for the Fat body. TailorMade fits a garment to the silhouette
    /// of the body and clips it there, which trims the flare of a skirt and the plates at the hips on the Average and Thin
    /// bodies (run 2026-10-08_wardrobe-tm against 2026-10-08_wardrobe-3). A garment drawn for the body needs no fitting.
    ///
    /// The same rule as <see cref="JacketArt"/> applies to shirts: only a garment that has the art for the body is left alone,
    /// any other is still fitted.
    /// </summary>
    public static class DressArt
    {
        private static readonly string[] Bodies = { "Male", "Female", "Thin", "Fat", "Hulk", "Child" };

        public static int Garments { get; private set; }

        public static void Apply()
        {
            Garments = 0;
            if (!TailorMadeLink.Loaded || !TailorMadeWaistlinesMod.Settings.keepDressesWhole) return;
            var mine = TailorMadeWaistlinesMod.Instance.Content.GetContentHolder<Texture2D>();
            foreach (string bodyName in Bodies)
            {
                BodyTypeDef body = DefDatabase<BodyTypeDef>.GetNamedSilentFail(bodyName);
                if (body == null) continue;
                var targets = new List<string>();
                foreach (ThingDef def in DefDatabase<ThingDef>.AllDefsListForReading)
                {
                    if (!IsFullLength(def)) continue;
                    string worn = def.apparel.wornGraphicPath;
                    if (string.IsNullOrEmpty(worn)) continue;
                    if (TrouserArt.TextureAt(worn + "_" + bodyName + "_south", mine) == null) continue;
                    targets.Add("^" + System.Text.RegularExpressions.Regex.Escape(def.defName) + "$");
                    Garments++;
                }
                if (targets.Count > 0) TailorMadeLink.LeaveAlone("TMW_NativeDress_" + bodyName, body, targets);
            }
            Log.Message("[TailorMade Waistlines] dresses: " + Garments + " garment/body pairs drawn for their body are left alone by TailorMade.");
        }

        /// <summary>A garment that covers the torso and the legs: a dress, a robe, a long coat.</summary>
        public static bool IsFullLength(ThingDef def)
        {
            ApparelProperties a = def?.apparel;
            if (a == null || a.bodyPartGroups == null) return false;
            bool torso = false, legs = false;
            foreach (BodyPartGroupDef g in a.bodyPartGroups)
            {
                if (g.defName == "Torso") torso = true;
                if (g.defName == "Legs") legs = true;
            }
            return torso && legs;
        }
    }
}
