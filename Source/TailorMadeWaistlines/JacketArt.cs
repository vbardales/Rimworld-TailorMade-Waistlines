using System;
using System.Collections.Generic;
using RimWorld;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// Lets a jacket reach down to the hem of the trousers. A vanilla jacket is drawn for a body with legs and ends at the
    /// waist; on WDI's bodies the trousers go on below it, so the jacket stops where the trousers begin. The jacket's art
    /// is stretched downwards, below the navel, until its hem lands on the lowest row of the trousers' shell for the same
    /// body and facing. Above the navel nothing moves, so the collar, the shoulders and the chest stay as drawn.
    ///
    /// Registered in this mod's own content, as the trousers are: the game takes the last loaded mod's texture for a path,
    /// so removing the mod puts the original jacket back.
    /// </summary>
    public static class JacketArt
    {
        private static readonly string[] FacingNames = { "south", "east", "north" };

        public static int Stretched { get; private set; }

        public static void Apply()
        {
            Stretched = 0;
            var settings = TailorMadeWaistlinesMod.Settings;
            if (settings == null || !settings.keepJacketsLong) return;
            // The trousers' shells are what the hem is measured on: without AB there are none.
            if (TrouserArt.FindPackPublic("AB.VPLRF") == null) return;

            var mine = TailorMadeWaistlinesMod.Instance.Content.GetContentHolder<Texture2D>();
            var done = new HashSet<string>();
            foreach (ThingDef def in DefDatabase<ThingDef>.AllDefsListForReading)
            {
                if (!IsLongGarment(def)) continue;
                string worn = def.apparel.wornGraphicPath;
                if (string.IsNullOrEmpty(worn) || !done.Add(worn)) continue;

                foreach (BodyTypeDef body in DefDatabase<BodyTypeDef>.AllDefsListForReading)
                {
                    if (!TrouserArt.BelowNavel.TryGetValue(body.defName, out float navel)) continue;
                    for (int f = 0; f < FacingNames.Length; f++)
                        Register(worn + "_" + body.defName + "_" + FacingNames[f], body.defName, FacingNames[f], navel, mine);
                }
            }

            Log.Message("[TailorMade Waistlines] jackets: " + Stretched + " textures stretched down to the hem of the trousers.");
        }

        /// <summary>A coat or a jacket: worn over the shirt, covers the torso and not the legs.</summary>
        public static bool IsLongGarment(ThingDef def)
        {
            ApparelProperties a = def?.apparel;
            if (a == null || a.LastLayer != ApparelLayerDefOf.Shell) return false;
            bool torso = false;
            foreach (BodyPartGroupDef g in a.bodyPartGroups ?? new List<BodyPartGroupDef>())
            {
                if (g.defName == "Legs" || g.defName == "Feet") return false;
                if (g.defName == "Torso") torso = true;
            }
            return torso;
        }

        private static void Register(string path, string body, string facing, float navel, ModContentHolder<Texture2D> mine)
        {
            if (mine.contentList.ContainsKey(path)) return;
            Texture2D jacket = TrouserArt.TextureAt(path, mine);
            Texture2D pants = TrouserArt.TextureAt(TrouserArt.PantsTexturePath(body, facing), mine);
            if (jacket == null || pants == null) return;
            try
            {
                byte[] pantsPx = TrouserArt.Read(pants, out int pw, out int ph);
                int hem = TrouserDetail.BottomRow(pantsPx, pw, ph);
                byte[] px = TrouserArt.Read(jacket, out int w, out int h);
                if (hem < 0 || h != ph) return;
                int pivot = (int)Math.Round(navel * h, MidpointRounding.AwayFromZero);
                byte[] stretched = TrouserDetail.StretchBottom(px, w, h, pivot, hem);
                if (ReferenceEquals(stretched, px)) return;
                mine.contentList[path] = TrouserArt.Build(stretched, w, h, "TMW_Jacket_" + path.Replace('/', '_'));
                Stretched++;
            }
            catch (Exception e)
            {
                Log.Warning("[TailorMade Waistlines] could not lengthen " + path + ": " + e.Message);
            }
        }
    }
}
