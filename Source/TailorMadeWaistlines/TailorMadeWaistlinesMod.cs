using System.Reflection;
using HarmonyLib;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    public class TailorMadeWaistlinesSettings : ModSettings
    {
        // Defaults are TailorMade's own values, so installing this mod changes
        // nothing until a slider is moved. Where the garment should stop is a
        // matter of the body art and of taste, and neither is ours to guess.
        public float pantsTop = 0.58f;
        public float bootsTop = 0.20f;
        public float chestBottom = 0.45f;

        // Off by default: it changes how every torso garment is drawn, and the
        // shirt is compressed into the band rather than cut off at it.
        public bool shortenShirts = false;

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Values.Look(ref pantsTop, "pantsTop", 0.58f);
            Scribe_Values.Look(ref bootsTop, "bootsTop", 0.20f);
            Scribe_Values.Look(ref chestBottom, "chestBottom", 0.45f);
            Scribe_Values.Look(ref shortenShirts, "shortenShirts", false);
        }
    }

    public class TailorMadeWaistlinesMod : Mod
    {
        public static TailorMadeWaistlinesSettings Settings;

        public TailorMadeWaistlinesMod(ModContentPack content) : base(content)
        {
            Settings = GetSettings<TailorMadeWaistlinesSettings>();
            new Harmony("nelim.tailormade.waistlines").PatchAll(Assembly.GetExecutingAssembly());
            LongEventHandler.ExecuteWhenFinished(Bands.SelfTest);
        }

        public override string SettingsCategory() => "TailorMade Waistlines";

        public override void DoSettingsWindowContents(Rect inRect)
        {
            var list = new Listing_Standard();
            list.Begin(inRect);

            list.Label("Where each garment class stops on the body. 0 is the hem, "
                + "1 is the top of the head. TailorMade's own values are 0.58, 0.20 and 0.45; "
                + "lower the first if trousers ride above the navel on a body drawn without legs.");
            list.Gap();

            Slider(list, "Pants reach up to", ref Settings.pantsTop, 0.20f, 0.90f);
            Slider(list, "Boots reach up to", ref Settings.bootsTop, 0.05f, 0.60f);
            Slider(list, "Chest pieces start at", ref Settings.chestBottom, 0.20f, 0.80f);

            list.Gap();
            list.CheckboxLabeled("Shorten full-body shirts",
                ref Settings.shortenShirts,
                "TailorMade only bands a torso garment whose art already starts 40% of the way "
                + "up, which leaves a vanilla shirt - drawn over the whole body - full length, "
                + "hiding the trousers entirely. This lifts that test for on-skin garments, and "
                + "the slider above then decides where they stop. Coats, parkas and robes are "
                + "worn on the shell layer and still drape to the ankles. Note that the shirt is "
                + "compressed into the band, not cut off at it, so collars and buttons are "
                + "squeezed along with it.");

            list.Gap();
            if (list.ButtonText("Reset to TailorMade's values"))
            {
                Settings.pantsTop = 0.58f;
                Settings.bootsTop = 0.20f;
                Settings.chestBottom = 0.45f;
                Settings.shortenShirts = false;
            }

            list.Gap();
            list.Label(Bands.DirectPatchWorks
                ? "Patched at the source: changes show as soon as this window closes."
                : "Running on the fallback patch: close the game and start it again for a "
                  + "change to show, because TailorMade's cached textures were keyed on the "
                  + "old value.");

            list.End();
        }

        private static void Slider(Listing_Standard list, string label, ref float value, float min, float max)
        {
            list.Label($"{label}: {value:0.00}");
            value = Widgets.HorizontalSlider(list.GetRect(22f), value, min, max, false, null, null, null, 0.01f);
        }

        public override void WriteSettings()
        {
            base.WriteSettings();
            // Every fitted texture was baked against the old bands, so they all
            // have to go. TailorMade does the whole sweep itself and repaints
            // the pawns already on the map.
            TailorMade.TailorMadeCache.ClearAndRepaint();
        }
    }
}
