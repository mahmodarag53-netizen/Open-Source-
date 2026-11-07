// Cue sheet per episode: SFX + music markers, timed exactly like the Remotion timeline.
// Usage: node tools/cues.mjs   → public/cues/<ep>.csv
import fs from "node:fs";
const FPS = 30, INTRO = 14, OUTRO = 84, PAD = 0.32;
const month = JSON.parse(fs.readFileSync("content/month-01.json", "utf8"));
fs.mkdirSync("public/cues", { recursive: true });
const tc = (fr) => {
  const s = Math.floor(fr / FPS), f = fr % FPS;
  return `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};
const SFX = {
  hero: "pop / paper pick-up", desk: "objects dropping on wood", compare: "two soft swishes",
  flow: "data blips (short ticks)", bars: "rising tick + soft click", steps: "pen check x3 (one per item)", bigtext: "stamp / thud",
};
for (const ep of month.episodes) {
  const rows = [["timecode", "frame", "track", "marker", "note"]];
  rows.push([tc(0), 0, "A3 MUSIC", "MUSIC IN", "light curious bed, -22 LUFS under VO"]);
  rows.push([tc(0), 0, "A2 SFX", "title whoosh", "title lines slide in"]);
  let from = INTRO;
  ep.scenes.forEach((sc, i) => {
    const n = String(i + 1).padStart(2, "0");
    let dur = 4;
    try { dur = JSON.parse(fs.readFileSync(`public/vo/${ep.id}/s${n}.json`, "utf8")).duration; } catch {}
    const frames = Math.ceil((dur + PAD) * FPS);
    if (i > 0) rows.push([tc(from - 4), from - 4, "A2 SFX", "whoosh (rack focus)", `into scene ${i + 1}`]);
    rows.push([tc(from + 6), from + 6, "A2 SFX", SFX[sc.visual.type] ?? "pop", `${sc.visual.type}${sc.visual.icon ? ":" + sc.visual.icon : ""}`]);
    rows.push([tc(from), from, "A1 VO", `VO s${n}`, sc.vo.slice(0, 40)]);
    from += frames;
  });
  rows.push([tc(from), from, "A2 SFX", "impact + paper", "punchline card"]);
  rows.push([tc(from), from, "A3 MUSIC", "MUSIC HIT / button", "end sting on punchline"]);
  rows.push([tc(from + OUTRO), from + OUTRO, "A3 MUSIC", "MUSIC OUT", "end of video"]);
  fs.writeFileSync(`public/cues/${ep.id}.csv`, "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
}
console.log("cues written:", month.episodes.length);
