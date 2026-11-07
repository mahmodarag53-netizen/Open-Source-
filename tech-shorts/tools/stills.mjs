// Render a contact sheet of stills: node tools/stills.mjs <comp> <outDir> <palette,...> <frame,...>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, out, pals, frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const palette of pals.split(",")) {
  const inputProps = { palette, motionBlur: false };
  const composition = await selectComposition({ serveUrl, id: comp, inputProps });
  for (const fr of frames.split(",").map(Number)) {
    await renderStill({ composition, serveUrl, output: `${out}/${comp}_${palette}_${fr}.png`, frame: Math.min(fr, composition.durationInFrames - 1), inputProps, scale: 0.5 });
  }
  console.log("done", palette, composition.durationInFrames);
}
