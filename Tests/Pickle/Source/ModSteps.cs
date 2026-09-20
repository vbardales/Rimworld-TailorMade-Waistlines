using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using HarmonyLib;
using RimWorld;
using RimWorks.Pickle;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines.PickleSteps
{
    /// <summary>
    /// Loading, the two patch routes, the hidden shortcut and the screenshot mode.
    ///
    /// Every step text carries the mod's name. Pickle loads the steps of every installed suite
    /// into one namespace, so a step called "I open the settings" would collide with any other
    /// suite that wanted the same sentence, and the collision fails healthy scenarios on both
    /// sides with "Ambiguous step".
    /// </summary>
    [PickleSteps]
    public class ModSteps
    {
        // The id the mod passes to `new Harmony(...)` in its constructor. It is a literal there,
        // so it is a literal here; a rename shows up as this step failing with the owners it did
        // find, which is the shortest route back to the cause.
        private const string HarmonyId = "nelim.tailormade.waistlines";

        // ---------------------------------------------------------------- the patches

        [Then("TailorMade Waistlines patched {string}")]
        public void Patched(PickleContext ctx, string target)
        {
            var parts = target.Split(new[] { "::" }, StringSplitOptions.None);
            ctx.Require(parts.Length == 2, $"write the target as Type::Member, not '{target}'");

            var type = AccessTools.TypeByName(parts[0]);
            ctx.Require(type != null, $"type '{parts[0]}' not found: TailorMade may have moved it");

            var method = AccessTools.DeclaredMethod(type, parts[1]);
            ctx.Require(method != null, $"'{target}' not found: TailorMade may have renamed it");

            var owners = Harmony.GetPatchInfo(method)?.Owners ?? (IEnumerable<string>)new string[0];
            ctx.Assert(owners.Contains(HarmonyId),
                $"'{target}' carries no TailorMade Waistlines patch; owners: " +
                (owners.Any() ? string.Join(", ", owners) : "none at all"));
        }

        /// <summary>
        /// Which of the two routes is live, and this is the whole reason there is a Pickle suite
        /// at all: <c>BandFor</c> is a small static method returning a switch over static fields,
        /// and whether Mono inlines it into its caller is a property of the running game. No check
        /// outside it can answer this - our own unit sets call the patch bodies directly, which
        /// proves what they do and nothing about whether Harmony got to apply them.
        /// </summary>
        [Then("the band patch route is settled")]
        public void RouteSettled(PickleContext ctx)
        {
            ctx.Attach("band patch route", TailorMadeWaistlines.Bands.DirectPatchWorks
                ? "direct: the postfix on ApparelClassifier.BandFor is the one running. A slider " +
                  "change shows as soon as the window closes."
                : "fallback: BandFor looks inlined, so the prefix on TexBake.BakeFitted is doing " +
                  "the work. Bands still move, but TailorMade's cache was keyed on the old value " +
                  "and a slider change needs a restart to show.");

            // Neither route is a failure. What would be one is the self-test never having run:
            // the flag would read false while nothing had tested anything.
            ctx.Assert(Log.Messages.Any(m => m.text != null && m.text.Contains("[TailorMade Waistlines]")),
                "the mod logged nothing at startup, so Bands.SelfTest never ran and the route above " +
                "is the default value of a flag, not a measurement");
        }

        [When("the pants band is set to {float}")]
        public void SetPants(PickleContext ctx, float value)
        {
            TailorMadeWaistlinesMod.Settings.pantsTop = value;
        }

        /// <summary>
        /// Asks TailorMade itself, through its own public method, rather than asking our patch.
        /// Whatever route carried the value, this is the number the bake will use.
        /// </summary>
        [Then("TailorMade answers {float} for the pants band")]
        public void TailorMadeAnswers(PickleContext ctx, float value)
        {
            var band = TailorMade.ApparelClassifier.BandFor(TailorMade.ApparelClass.Pants);
            ctx.Attach("band from TailorMade", $"({band.x:0.###}, {band.y:0.###}) for ApparelClass.Pants");

            if (!TailorMadeWaistlines.Bands.DirectPatchWorks)
            {
                // On the fallback route BandFor is not ours to answer for: the correction happens
                // later, inside BakeFitted. Saying so is worth more than failing a scenario for a
                // route the mod documents and handles.
                ctx.Assert(Math.Abs(band.y - TailorMadeWaistlines.Bands.StockPants.y) < 0.0005f,
                    $"the fallback route is live, so BandFor should still return TailorMade's own " +
                    $"{TailorMadeWaistlines.Bands.StockPants.y:0.##}; it returned {band.y:0.###}");
                return;
            }

            ctx.Assert(Math.Abs(band.y - value) < 0.0005f,
                $"TailorMade should answer {value:0.##} for the pants band; it answered {band.y:0.###}");
        }

        [Then("the mod logged no error since startup")]
        public void NoErrors(PickleContext ctx)
        {
            var lines = Log.Messages
                .Where(m => m.type == LogMessageType.Error &&
                            m.text != null && m.text.Contains("TailorMadeWaistlines"))
                .ToList();
            ctx.Assert(lines.Count == 0,
                "the mod is named in an error:\n" + string.Join("\n", lines.Select(m => m.text)));
        }

        // ---------------------------------------------------------------- the hidden shortcut

        private const string ShortcutDef = "TailorMadeWaistlines_Settings";

        private static MainButtonDef Shortcut(PickleContext ctx)
        {
            var def = DefDatabase<MainButtonDef>.GetNamedSilentFail(ShortcutDef);
            ctx.Require(def != null, $"the MainButtonDef '{ShortcutDef}' is not loaded");
            return def;
        }

        /// <summary>
        /// "Hidden by default" is a drawn state, not an XML field: what the bar shows is what the
        /// worker's own Visible says, and a button that is there but greyed out fails the same
        /// requirement as one that is shown. Both are read here.
        /// </summary>
        [Then("the TailorMade Waistlines shortcut is neither drawn nor greyed out")]
        public void ShortcutHidden(PickleContext ctx)
        {
            var def = Shortcut(ctx);
            ctx.Assert(!def.buttonVisible,
                "buttonVisible is true: the shortcut would be drawn on a clean configuration");
            ctx.Assert(!def.Worker.Visible,
                "the button bar draws the shortcut: its worker reports Visible");
            ctx.Assert(!def.Worker.Disabled,
                "the shortcut is drawn greyed out, which the settings workflow refuses as plainly " +
                "as a visible one - a customisation mod must be able to reveal a live button");
        }

        /// <summary>
        /// Opens the page the way the shortcut does, by running its own worker: a screenshot of
        /// that window is a screenshot of the real shortcut's destination, not of a window this
        /// suite built itself.
        ///
        /// Frames, not ticks. Dialog_ModSettings pauses the simulation, so "I wait N ticks" placed
        /// under it never advances and times out.
        /// </summary>
        [When("I open the TailorMade Waistlines settings through the shortcut and let it draw")]
        public async Task OpenThroughShortcut(PickleContext ctx)
        {
            Shortcut(ctx).Worker.Activate();
            await ctx.WaitFrames(10);
        }

        [Then("the settings window open is TailorMade Waistlines' own")]
        public void SettingsWindowIsOurs(PickleContext ctx)
        {
            var dialog = Find.WindowStack.WindowOfType<Dialog_ModSettings>();
            ctx.Require(dialog != null, "no mod settings window is open");

            var field = AccessTools.Field(typeof(Dialog_ModSettings), "mod");
            ctx.Require(field != null, "Dialog_ModSettings.mod no longer exists: update the step");

            var mod = field.GetValue(dialog) as Verse.Mod;
            ctx.Assert(mod is TailorMadeWaistlinesMod,
                $"the shortcut opened the settings of {mod?.Content?.Name ?? "no mod at all"}");
        }

        // ---------------------------------------------------------------- the language it runs in

        /// <summary>
        /// Every key the settings window draws, against the language the game is actually running.
        /// The file-level check in Tests/Check-Localization.ps1 compares the two Keyed folders on
        /// disk; it cannot know which language loaded, nor whether the game found the folder at
        /// all - on ext4 a mistyped folder name is enough to lose it.
        /// </summary>
        [Then("every settings key resolves in the language the game runs in")]
        public void KeysResolve(PickleContext ctx)
        {
            var keys = new[]
            {
                "TailorMadeWaistlines.Settings.Intro",
                "TailorMadeWaistlines.Settings.Scope",
                "TailorMadeWaistlines.Settings.PantsTop",
                "TailorMadeWaistlines.Settings.PantsTopTip",
                "TailorMadeWaistlines.Settings.BootsTop",
                "TailorMadeWaistlines.Settings.BootsTopTip",
                "TailorMadeWaistlines.Settings.ChestBottom",
                "TailorMadeWaistlines.Settings.ChestBottomTip",
                "TailorMadeWaistlines.Settings.ShortenShirts",
                "TailorMadeWaistlines.Settings.ShortenShirtsTip",
                "TailorMadeWaistlines.Settings.Reset",
                "TailorMadeWaistlines.Settings.PatchDirect",
                "TailorMadeWaistlines.Settings.PatchFallback",
            };

            var missing = keys.Where(k => !k.CanTranslate()).ToList();
            ctx.Attach("active language", LanguageDatabase.activeLanguage?.LegacyFolderName ?? "none");
            ctx.Assert(missing.Count == 0,
                $"{LanguageDatabase.activeLanguage?.LegacyFolderName} is missing: " + string.Join(", ", missing));
        }

        // ---------------------------------------------------------------- screenshots a person reads

        private static readonly Dictionary<Window, bool> hiddenForCapture = new Dictionary<Window, bool>();

        /// <summary>
        /// Turns on the game's own screenshot mode, which hides everything that is not a window,
        /// and hides Pickle's runner windows on top of that - a window keeps drawing in that mode
        /// unless it is told not to, so the runner's panel would otherwise sit in the corner of
        /// every capture.
        /// </summary>
        [When("I hide the interface around the windows on screen")]
        public async Task HideInterface(PickleContext ctx)
        {
            var flag = AccessTools.Field(typeof(Window), "drawInScreenshotMode");
            ctx.Require(flag != null, "Window.drawInScreenshotMode no longer exists: update the step");

            foreach (var window in Find.WindowStack.Windows)
            {
                var wanted = !window.GetType().Assembly.GetName().Name.StartsWith("RimWorks.Pickle");
                var current = (bool)flag.GetValue(window);
                if (current == wanted)
                {
                    continue;
                }

                hiddenForCapture[window] = current;
                flag.SetValue(window, wanted);
            }

            Find.UIRoot.screenshotMode.Active = true;
            await ctx.WaitFrames(3);
        }

        [When("I bring the interface back")]
        public void ShowInterface(PickleContext ctx) => RestoreInterface();

        /// <summary>
        /// A scenario dying between the two steps would leave the game without its interface, and
        /// no report would explain why.
        /// </summary>
        [AfterScenario]
        public void RestoreInterfaceAfterScenario(PickleContext ctx) => RestoreInterface();

        private static void RestoreInterface()
        {
            var flag = AccessTools.Field(typeof(Window), "drawInScreenshotMode");
            foreach (var pair in hiddenForCapture)
            {
                flag.SetValue(pair.Key, pair.Value);
            }

            hiddenForCapture.Clear();

            if (Find.UIRoot?.screenshotMode != null)
            {
                Find.UIRoot.screenshotMode.Active = false;
            }
        }
    }
}
