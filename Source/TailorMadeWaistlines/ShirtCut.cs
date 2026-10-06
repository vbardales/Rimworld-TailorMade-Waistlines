using System;
using HarmonyLib;
using TailorMade;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// Cuts an on-skin shirt where the underwear starts, after TailorMade has resized it to the body.
    ///
    /// Out of the chest band, TailorMade fits the shirt to the whole silhouette: shoulders and width are the body's. A vanilla
    /// shirt is drawn over the whole body though, so its hem has to be brought up to the trousers. Resizing the lower half does
    /// it badly (blurred hem); this erases the pixels below a line instead, as the masks of Apparel Paper Pattern and AbsCon do.
    ///
    /// The line is the top of the underwear WDI draws for the same body and sex (UWUnderwear, boxers), as a fraction of the
    /// picture counted from the top, measured with scripts/measure-underwear.js. Trousers drawn over the shirt hide the rest.
    /// </summary>
    public static class ShirtCut
    {
        // Top row of WDI's boxers over the height of its 512 px body, south view. Female variants of Thin, Hulk and Fat have
        // their own line: the body is a different drawing.
        internal static readonly System.Collections.Generic.Dictionary<string, float> Line = new System.Collections.Generic.Dictionary<string, float>
        {
            { "Male", 0.711f }, { "Female", 0.686f }, { "Thin", 0.699f }, { "Thin_Female", 0.674f },
            { "Fat", 0.643f }, { "Fat_Female", 0.643f }, { "Hulk", 0.799f }, { "Hulk_Female", 0.783f },
        };

        [ThreadStatic] private static string bodyKey;

        /// <summary>Erases every row from <paramref name="cutRow"/> down. Returns the input itself when there is nothing to erase.</summary>
        public static byte[] CutBelow(byte[] rgba, int width, int height, int cutRow)
        {
            if (rgba == null) throw new ArgumentNullException(nameof(rgba));
            if (width <= 0 || height <= 0 || rgba.Length != width * height * TrouserDetail.Channels)
                throw new ArgumentException("rgba must hold width * height * 4 bytes.");
            if (cutRow < 0 || cutRow >= height) return rgba;
            var px = (byte[])rgba.Clone();
            Array.Clear(px, cutRow * width * TrouserDetail.Channels, (height - cutRow) * width * TrouserDetail.Channels);
            return px;
        }

        /// <summary>Notes the body and the garment while TailorMade builds one graphic, so the bake that follows can cut it.</summary>
        [HarmonyPatch(typeof(Graphic_TailorMade), nameof(Graphic_TailorMade.Init))]
        public static class Init_Patch
        {
            public static void Prefix(GraphicRequest req)
            {
                bodyKey = null;
                if (!JacketArt.Active) return;
                string[] parts = req.path.Split(default(char));
                if (parts.Length < 3) return;
                ThingDef def = DefDatabase<ThingDef>.GetNamedSilentFail(parts[2]);
                if (JacketArt.Kind(def) != 2) return;
                ResolvedPattern pattern = PatternRegistry.Get(parts[1]);
                if (pattern?.BodyType == null) return;
                string key = pattern.BodyType.defName + (pattern.FemaleBody && pattern.BodyType.defName != "Female" ? "_Female" : "");
                if (Line.ContainsKey(key)) bodyKey = key;
            }

            public static void Finalizer() => bodyKey = null;
        }

        [HarmonyPatch(typeof(TexBake), nameof(TexBake.BakeFitted))]
        public static class BakeFitted_Patch
        {
            public static void Postfix(ref Texture2D __result)
            {
                if (bodyKey == null || __result == null) return;
                try
                {
                    byte[] px = TrouserArt.Read(__result, out int w, out int h);
                    int row = (int)Math.Round(Line[bodyKey] * h, MidpointRounding.AwayFromZero);
                    byte[] cut = CutBelow(px, w, h, row);
                    if (ReferenceEquals(cut, px)) return;
                    __result = TrouserArt.Build(cut, w, h, "TMW_ShirtCut_" + bodyKey);
                }
                catch (Exception e)
                {
                    Log.WarningOnce("[TailorMade Waistlines] could not cut a shirt: " + e.Message, 9482113);
                }
            }
        }
    }
}
