using System;
using System.Linq;
using System.Threading.Tasks;
using RimWorld;
using RimWorks.Pickle;
using TailorMade;
using Verse;

namespace TailorMadeWaistlines.PickleSteps
{
    /// <summary>
    /// The band as the running game uses it: which fitting claims a garment, and what moving a
    /// slider does to TailorMade's baked textures.
    ///
    /// None of this is checkable outside the game. `Tests/Check-Logic.ps1` proves what the patch
    /// bodies decide; whether a texture was thrown away and baked again is a property of a game
    /// with pawns drawn in it.
    /// </summary>
    [PickleSteps]
    public class BandSteps
    {
        /// <summary>Bake counts kept across the steps of one scenario.</summary>
        public sealed class Bakes
        {
            public int Before;
            public string Describe;
        }

        private static ThingDef Apparel(PickleContext ctx, string defName)
        {
            var def = DefDatabase<ThingDef>.GetNamedSilentFail(defName);
            ctx.Require(def != null, $"no ThingDef is named '{defName}'");
            ctx.Require(def.apparel != null, $"'{defName}' is not apparel");
            return def;
        }

        // ---------------------------------------------------------------- which fitting claims a garment

        /// <summary>
        /// Says, in the report, whether the band decides this garment at all. A
        /// <c>TailorPatternDef</c> with <c>autoFit</c> false takes the flag4 branch of
        /// <c>TexBake.BakeFitted</c>, which skips the fitting arithmetic entirely and samples the
        /// source through offset and scale alone: the band is never consulted, and the sliders of
        /// this mod are inert on that garment.
        ///
        /// It is attached rather than asserted because either state is legitimate - one is the
        /// mod's own feature, the other the native-fit experiment. What is not legitimate is a
        /// reviewer unable to tell which run an image came from, which is what this line fixes:
        /// every capture in the same scenario carries it.
        /// </summary>
        [Then("the fitting that claims {string} is recorded")]
        public void RecordFitting(PickleContext ctx, string defName)
        {
            ctx.Attach($"fitting for {defName}", DescribeFitting(ctx, defName));
        }

        /// <summary>The baseline the mod is about: nothing bypasses the band, so the sliders decide.</summary>
        [Then("the band decides the fit of {string}")]
        public void BandDecides(PickleContext ctx, string defName)
        {
            var described = DescribeFitting(ctx, defName);
            ctx.Attach($"fitting for {defName}", described);

            var pattern = Resolve(ctx, defName);
            ctx.Assert(pattern?.Def == null || pattern.Def.autoFit,
                $"'{pattern?.Def?.defName}' claims {defName} with autoFit false, so TailorMade skips the " +
                "band for it and every slider of this mod is inert on that garment. This run " +
                "photographs the native fit, not the band: move that def aside, or run the " +
                "native-fit scenarios instead");
        }

        private static ResolvedPattern Resolve(PickleContext ctx, string defName)
        {
            var apparel = Apparel(ctx, defName);
            var race = ThingDefOf.Human;
            var body = BodyTypeDefOf.Male;
            var layer = apparel.apparel.LastLayer;

            try
            {
                return PatternRegistry.Resolve(race, body, layer, apparel, femaleBody: false);
            }
            catch (Exception e)
            {
                ctx.Require(false, $"TailorMade.PatternRegistry.Resolve threw on {defName}: {e.Message}. " +
                    "Its signature may have changed; the step has to follow it");
                return null;
            }
        }

        private static string DescribeFitting(PickleContext ctx, string defName)
        {
            var apparel = Apparel(ctx, defName);
            var info = ApparelClassifier.Info(apparel);
            var band = ApparelClassifier.BandFor(info.cls);
            var pattern = Resolve(ctx, defName);

            var claim = pattern?.Def == null
                ? "no TailorPatternDef claims it, so TailorMade fits it into the band"
                : pattern.Def.autoFit
                    ? $"claimed by '{pattern.Def.defName}' with autoFit true: still fitted into the band"
                    : $"claimed by '{pattern.Def.defName}' with autoFit FALSE: the band is bypassed and " +
                      "this mod's sliders do nothing to this garment";

            return $"class {info.cls}, ignore {info.ignore}, band ({band.x:0.###}, {band.y:0.###})\n{claim}";
        }

        // ---------------------------------------------------------------- the sweep and the repaint

        [When("I let TailorMade bake what the map draws")]
        public async Task LetItBake(PickleContext ctx)
        {
            // Pawns bake on their first draw, so the count only moves once frames have passed.
            await ctx.WaitFrames(30);

            var stats = TexBake.Stats();
            ctx.Set(new Bakes { Before = stats.baked, Describe = Describe(stats) });
            ctx.Attach("baked before", Describe(stats));

            ctx.Require(stats.baked > 0,
                "TailorMade has baked nothing at all, so there is no sweep to observe. Either no pawn " +
                "on this map wears a garment it refits, or the mod filling wornGraphicPath is missing - " +
                "vanilla trousers carry no worn graphic, and a bare pawn bakes nothing");
        }

        /// <summary>
        /// The real path a player takes: the value changes and the window closes.
        /// <c>Mod.WriteSettings</c> is what the closing window calls, and our override is what
        /// asks TailorMade to sweep its cache and repaint the pawns already on the map. Setting
        /// the field alone would prove nothing about the repaint.
        /// </summary>
        [When("I move the pants band to {float} and close the settings window")]
        public async Task MoveBand(PickleContext ctx, float value)
        {
            TailorMadeWaistlinesMod.Settings.pantsTop = value;
            LoadedModManager.GetMod<TailorMadeWaistlinesMod>().WriteSettings();
            await ctx.WaitFrames(2);
        }

        [Then("TailorMade's fitted textures were swept")]
        public void Swept(PickleContext ctx)
        {
            var before = ctx.Get<Bakes>();
            var stats = TexBake.Stats();
            ctx.Attach("baked after the sweep", Describe(stats));

            ctx.Assert(stats.baked < before.Before,
                $"TailorMade still holds {stats.baked} fitted textures, against {before.Before} before the " +
                "window closed. Every one of them was baked against the old band, so a pawn would keep " +
                "wearing the old waistline until something else invalidated it");
        }

        [Then("the pawns on the map are drawn again")]
        public async Task Repainted(PickleContext ctx)
        {
            await ctx.WaitFrames(30);

            var stats = TexBake.Stats();
            ctx.Attach("baked after the repaint", Describe(stats));

            ctx.Assert(stats.baked > 0,
                "nothing has been baked since the sweep: the pawns were not repainted, and what is on " +
                "screen is whatever the renderer kept. A slider that needs a reload to show is the " +
                "fallback route's behaviour, and the report's route line says whether that is the case");
        }

        private static string Describe(TexBake.CacheStats stats) =>
            $"{stats.baked} fitted, {stats.readable} readable, {stats.bytes / 1024} kB";

        // ---------------------------------------------------------------- across a restart

        /// <summary>
        /// Reads the settings file back the way a restart does. What it cannot reproduce is a def
        /// database rebuilt from XML, so the full restart stays a manual check - scenario 8 of
        /// TESTING.md.
        /// </summary>
        [When("the mod reads its settings file again")]
        public void ReadBack(PickleContext ctx)
        {
            SettingsSandbox.ReloadFromDisk();
        }

        [Then("the pants band is {float}")]
        public void PantsBandIs(PickleContext ctx, float value)
        {
            var actual = TailorMadeWaistlinesMod.Settings.pantsTop;
            ctx.Assert(Math.Abs(actual - value) < 0.0005f,
                $"the pants band should be {value:0.##}; it is {actual:0.###}");
        }

        [Then("the settings file on disk holds {float} for the pants band")]
        public void FileHolds(PickleContext ctx, float value)
        {
            var path = SettingsSandbox.SettingsPath;
            ctx.Require(System.IO.File.Exists(path), $"no settings file at {path}");

            var text = System.IO.File.ReadAllText(path);
            ctx.Attach("settings file", text);

            // Read as the game reads it: the value is what Scribe wrote, not a string match on a
            // formatting that varies with the culture the game runs in.
            var line = text.Split('\n').FirstOrDefault(l => l.Contains("<pantsTop>"));
            ctx.Require(line != null, "the file holds no <pantsTop> element: nothing was written");

            var written = line.Trim().Replace("<pantsTop>", "").Replace("</pantsTop>", "");
            ctx.Require(float.TryParse(written, System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out var parsed),
                $"'{written}' is not a number this step can read");

            ctx.Assert(Math.Abs(parsed - value) < 0.0005f,
                $"the file holds {parsed:0.###} for the pants band, not {value:0.##}");
        }
    }
}
