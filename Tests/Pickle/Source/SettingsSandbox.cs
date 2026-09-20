using System.IO;
using System.Reflection;
using RimWorks.Pickle;
using Verse;

namespace TailorMadeWaistlines.PickleSteps
{
    /// <summary>
    /// The sliders are global settings written to disk, so a scenario run on her own game would
    /// otherwise leave her waistline wherever a test left it. Each scenario starts from
    /// TailorMade's own defaults, and her file is put back afterwards.
    ///
    /// The backup is a file, not a copy in memory: if the game dies mid-scenario, the next
    /// scenario finds the backup still there and restores it instead of overwriting it with the
    /// test values.
    /// </summary>
    [PickleSteps]
    public class SettingsSandbox
    {
        private const BindingFlags Any = BindingFlags.Static | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;

        public static string SettingsPath
        {
            get
            {
                var mod = LoadedModManager.GetMod<TailorMadeWaistlinesMod>();
                var method = typeof(LoadedModManager).GetMethod("GetSettingsFilename", Any);
                return (string)method.Invoke(null, new object[] { mod.Content.FolderName, mod.GetType().Name });
            }
        }

        private static string BackupPath => SettingsPath + ".pickle-backup";

        [BeforeScenario]
        public void IsolateSettings(PickleContext ctx)
        {
            if (File.Exists(BackupPath))
            {
                // Left behind by a run that never finished: the backup is her real file.
                Restore();
            }

            // Write first, so there is a file to copy even on a configuration that has never had
            // one - which is exactly the state a fresh install is in.
            Save();
            File.Copy(SettingsPath, BackupPath, overwrite: false);

            TailorMadeWaistlinesMod.Settings.ResetToDefaults();
            Save();
        }

        [AfterScenario]
        public void RestoreSettings(PickleContext ctx)
        {
            if (File.Exists(BackupPath))
            {
                Restore();
            }
        }

        private static TailorMadeWaistlinesMod Mod => LoadedModManager.GetMod<TailorMadeWaistlinesMod>();

        /// <summary>
        /// Writes the file without the mod's own <c>WriteSettings</c>, which also sweeps
        /// TailorMade's texture cache and repaints the pawns on the map. That sweep is the subject
        /// of scenario 02 and has no business running around every scenario - at the main menu
        /// there is not even a map for it to repaint.
        /// </summary>
        private static void Save() =>
            LoadedModManager.WriteModSettings(Mod.Content.FolderName, Mod.GetType().Name, TailorMadeWaistlinesMod.Settings);

        private static void Restore()
        {
            File.Copy(BackupPath, SettingsPath, overwrite: true);
            File.Delete(BackupPath);
            ReloadFromDisk();

            // Her bands are back, and every texture baked during the scenario was baked against
            // the test ones. The sweep is only wanted where there is something drawn to repaint.
            if (Current.ProgramState == ProgramState.Playing)
            {
                Mod.WriteSettings();
            }
        }

        /// <summary>
        /// Reads the settings file again, the way a restart does. The persistence scenario uses
        /// this same path, so it is under test there rather than being a convenience of the
        /// sandbox.
        /// </summary>
        public static void ReloadFromDisk()
        {
            var mod = Mod;
            typeof(Verse.Mod).GetField("modSettings", BindingFlags.Instance | BindingFlags.NonPublic)
                .SetValue(mod, null);
            TailorMadeWaistlinesMod.Settings = mod.GetSettings<TailorMadeWaistlinesSettings>();
        }
    }
}
