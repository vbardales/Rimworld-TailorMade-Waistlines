using System;
using System.Collections.Generic;
using UnityEngine;
using Verse;

namespace TailorMadeWaistlines
{
    /// <summary>
    /// Fits the bodice of a dress to the breasts WDI draws. A dress is drawn for the vanilla body of its type; WDI's female bodies
    /// have the bust lower, higher or wider, and a dress drawn for another bust either ends above the breasts or leaves skin
    /// bare at the sides (the Fat body).
    ///
    /// Two steps, on the front view only. First the picture is stretched on its rows, in bands, so that three lines of the dress
    /// (the top of the bodice, the tip of the V of the neckline, the closing of the cups) land on the three lines of the body
    /// (halfway between the armpit and the nipple, the nipple, the under breast). Then, between the first and the last line, the
    /// bust is rebuilt: the silhouette of the body is filled with the cloth of the dress, WDI's bra gives the volume of the cups
    /// (its inside only, never its lines), and the black stroke along the edge of the body is the outline.
    ///
    /// The lines of the body are in docs/BUST-LINES.md, those of a dress are read on its own picture (scripts/bust-fit-preview.js
    /// is the same code, offline, with the pictures it produced).
    /// </summary>
    public static class BustFit
    {
        // WDI's female body for each body type of a dress: top of the bust (halfway armpit-nipple), nipple, under breast, in rows
        // of the 512 px picture counted from the top.
        internal static readonly Dictionary<string, int[]> BodyLines = new Dictionary<string, int[]>
        {
            { "Female", new[] { 246, 277, 308 } },
            { "Thin", new[] { 242, 264, 289 } },
            { "Fat", new[] { 245, 278, 321 } },
            { "Hulk", new[] { 269, 299, 339 } },
        };

        // The WDI picture of the body that a dress of each type is fitted to.
        private static readonly Dictionary<string, string> BodyKey = new Dictionary<string, string>
        {
            { "Female", "Female" }, { "Thin", "Thin_Female" }, { "Fat", "Fat_Female" }, { "Hulk", "Hulk_Female" },
        };

        // The garments whose lines have been read: def name -> body type -> top of the bodice, tip of the V, closing of the cups.
        internal static readonly Dictionary<string, Dictionary<string, int[]>> DressLines = new Dictionary<string, Dictionary<string, int[]>>
        {
            { "Apparel_UNARoyalDress", new Dictionary<string, int[]>
                {
                    { "Female", new[] { 242, 282, 293 } },
                    { "Thin", new[] { 246, 257, 274 } },
                    { "Fat", new[] { 232, 277, 286 } },
                    { "Hulk", new[] { 266, 310, 326 } },
                }
            },
        };

        private const int Fade = 90;          // rows under the cups over which the shift fades out, so that the hem stays where it was drawn
        private const int Feather = 3;        // rows at both ends of the rebuilt bust that blend into the dress
        private static readonly byte[] Cloth = { 236, 236, 236 };

        public static int Fitted { get; private set; }

        public static void Apply()
        {
            Fitted = 0;
            var mine = TailorMadeWaistlinesMod.Instance.Content.GetContentHolder<Texture2D>();
            foreach (KeyValuePair<string, Dictionary<string, int[]>> garment in DressLines)
            {
                ThingDef def = DefDatabase<ThingDef>.GetNamedSilentFail(garment.Key);
                string worn = def?.apparel?.wornGraphicPath;
                if (string.IsNullOrEmpty(worn)) continue;
                foreach (KeyValuePair<string, int[]> line in garment.Value)
                {
                    string path = worn + "_" + line.Key + "_south";
                    string key = BodyKey[line.Key];
                    try
                    {
                        Texture2D dress = TrouserArt.TextureAt(path, mine);
                        Texture2D body = ContentFinder<Texture2D>.Get("Things/Pawn/Humanlike/Bodies/Naked_" + key + "_south", false);
                        Texture2D bra = ContentFinder<Texture2D>.Get("UWUnderwear/bra/bra_" + key + "_south", false);
                        if (dress == null || body == null) continue;
                        byte[] d = TrouserArt.Read(dress, out int w, out int h);
                        byte[] b = TrouserArt.Read(body, out int bw, out int bh);
                        byte[] br = bra == null ? null : TrouserArt.Read(bra, out int rw, out int rh);
                        if (bw != w || bh != h) continue;
                        byte[] fitted = Fit(d, b, br, w, h, BodyLines[line.Key], line.Value);
                        mine.contentList[path] = TrouserArt.Build(fitted, w, h, "TMW_Bust_" + path.Replace('/', '_'));
                        Fitted++;
                    }
                    catch (Exception e)
                    {
                        Log.Warning("[TailorMade Waistlines] could not fit the bust of " + path + ": " + e.Message);
                    }
                }
            }
            Log.Message("[TailorMade Waistlines] bust: " + Fitted + " dress pictures fitted to the breasts of WDI's bodies.");
        }

        /// <summary>The stretched dress, with its bust rebuilt on the body. All pictures are width x height, top row first, RGBA.</summary>
        public static byte[] Fit(byte[] dress, byte[] body, byte[] bra, int width, int height, int[] bodyLines, int[] dressLines)
        {
            byte[] tall = WarpRows(dress, width, height, RowMap(height, bodyLines, dressLines));
            return Rebuild(tall, body, bra, width, height, bodyLines[0], bodyLines[2]);
        }

        /// <summary>For each row of the result, the row of the dress it is read from: piecewise linear between the line pairs.</summary>
        public static float[] RowMap(int height, int[] body, int[] dress)
        {
            int bt = body[0], bn = body[1], bu = body[2], dt = dress[0], dn = dress[1], du = dress[2];
            var src = new float[height];
            for (int r = 0; r < height; r++)
            {
                float s;
                if (r < bt) s = r + (dt - bt);
                else if (r < bn) s = dt + (r - bt) * (float)(dn - dt) / (bn - bt);
                else if (r < bu) s = dn + (r - bn) * (float)(du - dn) / (bu - bn);
                else
                {
                    float shift = du - bu;
                    float t = Math.Min(1f, (r - bu) / (float)Fade);
                    s = r + shift * (1f - t);
                }
                src[r] = Math.Max(0f, Math.Min(height - 1, s));
            }
            return src;
        }

        public static byte[] WarpRows(byte[] rgba, int width, int height, float[] src)
        {
            var output = new byte[rgba.Length];
            for (int r = 0; r < height; r++)
            {
                int a = (int)Math.Floor(src[r]), b = Math.Min(height - 1, a + 1);
                float f = src[r] - a;
                for (int i = 0; i < width * 4; i++)
                    output[r * width * 4 + i] = (byte)Math.Round(rgba[a * width * 4 + i] * (1f - f) + rgba[b * width * 4 + i] * f);
            }
            return output;
        }

        private static bool Dark(byte[] px, int i) => px[i] < 60 && px[i + 1] < 60 && px[i + 2] < 60;

        /// <summary>Between rows <paramref name="top"/> and <paramref name="cups"/>: the body as cloth, the cups of the bra on it, the stroke of the body kept.</summary>
        public static byte[] Rebuild(byte[] dress, byte[] body, byte[] bra, int width, int height, int top, int cups)
        {
            var output = (byte[])dress.Clone();
            // the first and last opaque column of every row of the body, and the unbroken dark stroke that starts at each edge
            var left = new int[height]; var right = new int[height]; var runL = new int[height]; var runR = new int[height];
            for (int r = 0; r < height; r++)
            {
                left[r] = -1; right[r] = -1;
                for (int x = 0; x < width; x++)
                    if (body[(r * width + x) * 4 + 3] >= 128) { if (left[r] < 0) left[r] = x; right[r] = x; }
                if (left[r] < 0) continue;
                while (left[r] + runL[r] <= right[r] && body[(r * width + left[r] + runL[r]) * 4 + 3] >= 128 && Dark(body, (r * width + left[r] + runL[r]) * 4)) runL[r]++;
                while (right[r] - runR[r] >= left[r] && body[(r * width + right[r] - runR[r]) * 4 + 3] >= 128 && Dark(body, (r * width + right[r] - runR[r]) * 4)) runR[r]++;
            }
            // a nipple that touches the stroke makes the run longer than the stroke: cap it at the median thickness around the bust
            var around = new List<int>();
            for (int r = Math.Max(0, top - 30); r < Math.Min(height, cups + 30); r++) { if (runL[r] > 0) around.Add(runL[r]); if (runR[r] > 0) around.Add(runR[r]); }
            around.Sort();
            int thickness = around.Count == 0 ? 12 : around[around.Count / 2] + 1;

            for (int r = top; r <= cups && r < height; r++)
            {
                float edge = Math.Min(1f, Math.Min(r - top, cups - r) / (float)Feather + 0.01f);
                for (int x = 0; x < width; x++)
                {
                    int i = (r * width + x) * 4;
                    // under: the skin, as cloth
                    byte[] px = Tint(body, i, false, left[r], right[r], x, Math.Min(runL[r], thickness), Math.Min(runR[r], thickness));
                    // over: the inside of the cups, never their outline
                    byte[] cup = bra == null ? null : Tint(bra, i, true, 0, 0, x, 0, 0);
                    if (cup != null && px != null && !(px[0] < 60 && px[1] < 60 && px[2] < 60)) px = cup;
                    else if (cup != null && px == null) px = new byte[] { 0, 0, 0, 255 };
                    if (px == null) { output[i + 3] = 0; continue; }
                    for (int k = 0; k < 4; k++) output[i + k] = (byte)Math.Round(px[k] * edge + dress[i + k] * (1f - edge));
                }
            }
            return output;
        }

        private static byte[] Tint(byte[] img, int i, bool isBra, int left, int right, int x, int runL, int runR)
        {
            byte a = img[i + 3];
            if (a < 8) return null;
            if (Dark(img, i))
            {
                if (isBra) return null;
                if (left >= 0 && (x - left < runL || right - x < runR)) return new[] { img[i], img[i + 1], img[i + 2], a };
                return new[] { (byte)(Cloth[0] * 0.9f), (byte)(Cloth[1] * 0.9f), (byte)(Cloth[2] * 0.9f), a };
            }
            float lum = (img[i] + img[i + 1] + img[i + 2]) / 3f / 255f;
            lum = isBra ? lum * 0.18f + 0.82f : Math.Max(0.72f, lum);
            return new[] { (byte)(Cloth[0] * lum), (byte)(Cloth[1] * lum), (byte)(Cloth[2] * lum), a };
        }
    }
}
