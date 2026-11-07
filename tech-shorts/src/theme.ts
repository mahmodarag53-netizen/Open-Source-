import { Easing, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// Fonts are bundled locally (public/fonts) so rendering never depends on the network.
const AR = "U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1";
const LA = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const RAR = "U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1";
const RLA = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
export const FONT_TITLE = "Naskh";
export const FONT_UI = "Readex";
for (const [family, file, weight, unicodeRange] of [
  [FONT_TITLE, "naskh-700-arabic", "700", AR],
  [FONT_TITLE, "naskh-700-latin", "700", LA],
  [FONT_UI, "readex-400-arabic", "400", RAR],
  [FONT_UI, "readex-400-latin", "400", RLA],
  [FONT_UI, "readex-600-arabic", "600", RAR],
  [FONT_UI, "readex-600-latin", "600", RLA],
] as const) {
  loadFont({ family, url: staticFile(`fonts/${file}.woff2`), weight, unicodeRange, format: "woff2" });
}

export type Palette = {
  paper: string; grid: string; ink: string; inkSoft: string; orange: string; orangeSoft: string;
  olive: string; oliveSoft: string; sand: string; blue: string; blueSoft: string; white: string;
  shadow: string; vignette: string; dim: string;
};

// "orange" / "olive" / "blue" are role names (accent / positive / info) kept for the components.
export const PALETTES: Record<string, Palette> = {
  // A — graphite chalkboard, acid-lime signal, lilac second voice
  graphite: {
    paper: "#1A1C20", grid: "#2E3138", ink: "#EEEADF", inkSoft: "#9B978D", orange: "#C9F25E", orangeSoft: "#6F8C36",
    olive: "#8F7CFF", oliveSoft: "#4B4380", sand: "#2A2D33", blue: "#4CC9B8", blueSoft: "#2A5A55", white: "#23262B",
    shadow: "rgba(0,0,0,0.55)", vignette: "rgba(0,0,0,0.55)", dim: "rgba(238,234,223,0.35)",
  },
  // B — cool stone paper, deep-green ink, cobalt signal
  stone: {
    paper: "#E6ECE8", grid: "#CFDAD4", ink: "#14302A", inkSoft: "#587069", orange: "#2E5BFF", orangeSoft: "#A9BCFF",
    olive: "#1E8C6E", oliveSoft: "#A5DCC7", sand: "#D3DED8", blue: "#D9A520", blueSoft: "#F1DC9C", white: "#F6F9F7",
    shadow: "rgba(20,48,42,0.22)", vignette: "rgba(20,48,42,0.18)", dim: "rgba(20,48,42,0.32)",
  },
  // C — midnight navy, signal yellow, mint
  midnight: {
    paper: "#0F2436", grid: "#1C3448", ink: "#F1EEE5", inkSoft: "#93A3B1", orange: "#FFD43B", orangeSoft: "#8A7424",
    olive: "#62D9B5", oliveSoft: "#2A5E57", sand: "#183044", blue: "#F59AC0", blueSoft: "#6A3E57", white: "#152C40",
    shadow: "rgba(0,0,0,0.5)", vignette: "rgba(0,8,16,0.6)", dim: "rgba(241,238,229,0.35)",
  },
};

// Mutable live palette: Episode calls setPalette() before rendering children.
export const C: Palette = { ...PALETTES.graphite };
export const setPalette = (name: string) => Object.assign(C, PALETTES[name] ?? PALETTES.graphite);

export const BRAND = {
  series: "طيب شلون؟",
  author: "محمود أعرج",
  authorLatin: "Mahmoud Arag",
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Bezier curves only — never linear.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
