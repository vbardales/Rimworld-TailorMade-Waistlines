using System.Reflection;
using HarmonyLib;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    public class TailorMadeWaistlinesSettings : ModSettings
    {
        // The three bands default to TailorMade's own values, so installing this
        // mod moves nothing until a slider is moved: where a garment should stop
        // is a matter of the body art and of taste, and neither is ours to guess.
        // The two art options below are different. They exist to fix trousers that
        // read as a plain shell, so they are on: they only ever act where AB's
        // Visible Pants is active, and they are read at startup.
        public const float DefaultPantsTop = 0.58f;
        public const float DefaultBootsTop = 0.20f;
        public const float DefaultChestBottom = 0.45f;

        // The slider ranges. A value read back from the config file is brought
        // into them too, so a hand-edited or damaged file cannot ask TailorMade
        // for a band outside the body.
        public const float PantsMin = 0.20f, PantsMax = 0.90f;
        public const float BootsMin = 0.05f, BootsMax = 0.60f;
        public const float ChestMin = 0.20f, ChestMax = 0.80f;

        // How far the trouser art this mod supplies is moved down the body, as a fraction of its own
        // height. Two values, because a child is drawn smaller: the same fraction is fewer pixels on
        // screen. The defaults come from a player asking, at 1080p and the closest zoom, for the
        // trousers to sit 2 pixels lower on an adult and 4 on a child than they did at 0.02. Measured
        // on captures, an adult is about 73 pixels tall there and a child about 49, so 0.05 is about
        // 3.7 pixels and 0.10 about 4.9. They are starting points: they will not suit every body art.
        public const float DefaultTrouserDrop = 0.05f;
        public const float DefaultChildTrouserDrop = 0.10f;
        public const float TrouserDropMin = 0f, TrouserDropMax = 0.15f;

        public float pantsTop = DefaultPantsTop;
        public float bootsTop = DefaultBootsTop;
        public float chestBottom = DefaultChestBottom;

        // Off by default: it changes how every on-skin torso garment is drawn,
        // and the shirt is compressed into the band rather than cut off at it.
        public bool shortenShirts = false;

        // Take General Textures Collection's trouser art where AB supplies a plain shell, and
        // draw details onto the shells that have no such art. Both read at startup.
        public bool useGeneralArt = true;
        public bool detailPlainShells = true;
        public float trouserDrop = DefaultTrouserDrop;
        public float trouserDropChild = DefaultChildTrouserDrop;

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Values.Look(ref pantsTop, "pantsTop", DefaultPantsTop);
            Scribe_Values.Look(ref bootsTop, "bootsTop", DefaultBootsTop);
            Scribe_Values.Look(ref chestBottom, "chestBottom", DefaultChestBottom);
            Scribe_Values.Look(ref shortenShirts, "shortenShirts", false);
            Scribe_Values.Look(ref useGeneralArt, "useGeneralArt", true);
            Scribe_Values.Look(ref detailPlainShells, "detailPlainShells", true);
            Scribe_Values.Look(ref trouserDrop, "trouserDrop", DefaultTrouserDrop);
            Scribe_Values.Look(ref trouserDropChild, "trouserDropChild", DefaultChildTrouserDrop);

            if (Scribe.mode == LoadSaveMode.PostLoadInit)
                Sanitize();
        }

        /// <summary>Brings every value into its slider's range; NaN and infinity fall back to the default.</summary>
        public void Sanitize()
        {
            pantsTop = Clean(pantsTop, PantsMin, PantsMax, DefaultPantsTop);
            bootsTop = Clean(bootsTop, BootsMin, BootsMax, DefaultBootsTop);
            chestBottom = Clean(chestBottom, ChestMin, ChestMax, DefaultChestBottom);
            trouserDrop = Clean(trouserDrop, TrouserDropMin, TrouserDropMax, DefaultTrouserDrop);
            trouserDropChild = Clean(trouserDropChild, TrouserDropMin, TrouserDropMax, DefaultChildTrouserDrop);
        }

        public void ResetToDefaults()
        {
            pantsTop = DefaultPantsTop;
            bootsTop = DefaultBootsTop;
            chestBottom = DefaultChestBottom;
            shortenShirts = false;
            useGeneralArt = true;
            detailPlainShells = true;
            trouserDrop = DefaultTrouserDrop;
            trouserDropChild = DefaultChildTrouserDrop;
        }

        private static float Clean(float value, float min, float max, float fallback)
        {
            if (float.IsNaN(value) || float.IsInfinity(value)) return fallback;
            return Mathf.Clamp(value, min, max);
        }
    }

    public class TailorMadeWaistlinesMod : Mod
    {
        public static TailorMadeWaistlinesMod Instance { get; private set; }
        public static TailorMadeWaistlinesSettings Settings;

        private Vector2 scrollPosition;
        private float viewHeight = 600f;

        public TailorMadeWaistlinesMod(ModContentPack content) : base(content)
        {
            Instance = this;
            Settings = GetSettings<TailorMadeWaistlinesSettings>();
            new Harmony("nelim.tailormade.waistlines").PatchAll(Assembly.GetExecutingAssembly());
            LongEventHandler.ExecuteWhenFinished(Bands.SelfTest);
            // After the game has loaded every mod's textures, which is when there is something to replace.
            LongEventHandler.ExecuteWhenFinished(TrouserArt.Apply);
        }

        // The mod's own name, a proper noun: the one player-facing string that is not a key.
        public override string SettingsCategory() => "TailorMade Waistlines";

        public override void DoSettingsWindowContents(Rect inRect)
        {
            var viewRect = new Rect(0f, 0f, inRect.width - 20f, viewHeight);
            Widgets.BeginScrollView(inRect, ref scrollPosition, viewRect);

            var list = new Listing_Standard();
            list.Begin(viewRect);

            list.Label("TailorMadeWaistlines.Settings.Intro".Translate());
            list.Label("TailorMadeWaistlines.Settings.Scope".Translate());
            list.Gap();

            Slider(list, "TailorMadeWaistlines.Settings.PantsTop", "TailorMadeWaistlines.Settings.PantsTopTip",
                ref Settings.pantsTop, TailorMadeWaistlinesSettings.PantsMin, TailorMadeWaistlinesSettings.PantsMax);
            Slider(list, "TailorMadeWaistlines.Settings.BootsTop", "TailorMadeWaistlines.Settings.BootsTopTip",
                ref Settings.bootsTop, TailorMadeWaistlinesSettings.BootsMin, TailorMadeWaistlinesSettings.BootsMax);
            Slider(list, "TailorMadeWaistlines.Settings.ChestBottom", "TailorMadeWaistlines.Settings.ChestBottomTip",
                ref Settings.chestBottom, TailorMadeWaistlinesSettings.ChestMin, TailorMadeWaistlinesSettings.ChestMax);

            list.Gap();
            list.CheckboxLabeled("TailorMadeWaistlines.Settings.ShortenShirts".Translate(),
                ref Settings.shortenShirts,
                "TailorMadeWaistlines.Settings.ShortenShirtsTip".Translate());

            list.Gap();
            list.CheckboxLabeled("TailorMadeWaistlines.Settings.UseGeneralArt".Translate(),
                ref Settings.useGeneralArt,
                "TailorMadeWaistlines.Settings.UseGeneralArtTip".Translate());
            list.CheckboxLabeled("TailorMadeWaistlines.Settings.DetailShells".Translate(),
                ref Settings.detailPlainShells,
                "TailorMadeWaistlines.Settings.DetailShellsTip".Translate());
            Slider(list, "TailorMadeWaistlines.Settings.TrouserDrop", "TailorMadeWaistlines.Settings.TrouserDropTip",
                ref Settings.trouserDrop, TailorMadeWaistlinesSettings.TrouserDropMin, TailorMadeWaistlinesSettings.TrouserDropMax);
            Slider(list, "TailorMadeWaistlines.Settings.TrouserDropChild", "TailorMadeWaistlines.Settings.TrouserDropChildTip",
                ref Settings.trouserDropChild, TailorMadeWaistlinesSettings.TrouserDropMin, TailorMadeWaistlinesSettings.TrouserDropMax);
            list.Label("TailorMadeWaistlines.Settings.ArtNeedsRestart".Translate());

            list.Gap();
            if (list.ButtonText("TailorMadeWaistlines.Settings.Reset".Translate()))
                Settings.ResetToDefaults();

            list.Gap();
            list.Label(Bands.DirectPatchWorks
                ? "TailorMadeWaistlines.Settings.PatchDirect".Translate()
                : "TailorMadeWaistlines.Settings.PatchFallback".Translate());

            viewHeight = list.CurHeight + 10f;
            list.End();
            Widgets.EndScrollView();
        }

        private static void Slider(Listing_Standard list, string labelKey, string tipKey, ref float value, float min, float max)
        {
            Rect label = list.Label(labelKey.Translate(value.ToString("0.00")));
            TooltipHandler.TipRegion(label, tipKey.Translate());
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
