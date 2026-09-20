using RimWorld;
using Verse;

namespace TailorMadeWaistlines
{
    // Inherits the native visibility rules, so a customization mod such as RIMMSQOL can reveal
    // this optional shortcut. It opens the same window, on the same settings, as Mod options.
    public class MainButtonWorker_TailorMadeWaistlines : MainButtonWorker
    {
        public override void Activate()
        {
            if (TailorMadeWaistlinesMod.Instance != null)
                Find.WindowStack.Add(new Dialog_ModSettings(TailorMadeWaistlinesMod.Instance));
        }
    }
}
