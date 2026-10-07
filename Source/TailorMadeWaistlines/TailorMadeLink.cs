using System;
using System.Collections.Generic;
using System.Reflection;
using RimWorld;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// The one place this mod reaches into TailorMade, which is optional. Every method that names a TailorMade type is
    /// here, and callers only come here after <see cref="Loaded"/>: the game compiles a method when it first runs it, so
    /// without TailorMade nothing in this class is ever compiled and nothing fails to load. The Harmony patches on
    /// TailorMade's types (<see cref="Bands"/>, <see cref="ChestArt"/>, <see cref="ShirtCut"/>) are applied by the mod's
    /// constructor, also only when it is loaded.
    /// </summary>
    public static class TailorMadeLink
    {
        public const string PackageId = "astryl.tailormade";

        public static bool Loaded => ModsConfig.IsActive(PackageId);

        public static void SayAbsent() =>
            Log.Message("[TailorMade Waistlines] TailorMade is not loaded: its bands and its resizing are not patched.");

        /// <summary>Tells TailorMade to leave the garments matching these def-name patterns alone on a body type.</summary>
        public static void LeaveAlone(string defName, BodyTypeDef body, List<string> targets)
        {
            if (DefDatabase<TailorMade.TailorPatternDef>.GetNamedSilentFail(defName) != null) return;
            DefDatabase<TailorMade.TailorPatternDef>.Add(new TailorMade.TailorPatternDef
            {
                defName = defName, bodyType = body, ignore = true, targetApparelDefs = new List<string>(targets),
            });
        }

        public static bool HasReadItsDefs()
        {
            try
            {
                FieldInfo defs = typeof(TailorMade.PatternRegistry).GetField("defs", BindingFlags.NonPublic | BindingFlags.Static);
                return defs != null && defs.GetValue(null) != null;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>Every fitted texture was baked against the old bands: TailorMade sweeps them and repaints the pawns.</summary>
        public static void ClearAndRepaint() => TailorMade.TailorMadeCache.ClearAndRepaint();

        public static void SelfTestBands() => Bands.SelfTest();
    }
}
