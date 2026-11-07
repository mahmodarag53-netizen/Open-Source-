import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import month from "../content/month-01.json";
import { Episode, EpisodeProps, INTRO, OUTRO, PAD, Word } from "./Episode";
import { FPS, H, W } from "./theme";
import type { Visual } from "./visuals";

type Ch = { text: string; start_time: number; end_time: number };

// Script words timed from HeyGen's per-character timestamps (they map 1:1 to the script text).
const wordsFromChars = (chars: Ch[]): Word[] => {
  const out: Word[] = [];
  let cur: Ch[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({ w: cur.map((c) => c.text).join(""), start: cur[0].start_time, end: cur[cur.length - 1].end_time });
    cur = [];
  };
  chars.forEach((c) => (/\s/.test(c.text) ? flush() : cur.push(c)));
  flush();
  return out;
};

const calc: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const ep = month.episodes.find((e) => e.id === props.id)!;
  let from = INTRO;
  const scenes = [];
  for (let i = 0; i < ep.scenes.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    let dur = 4;
    let words: Word[] = [];
    let audio: string | null = null;
    try {
      const meta = await (await fetch(staticFile(`vo/${ep.id}/s${n}.json`))).json();
      dur = meta.duration;
      words = wordsFromChars(meta.chars ?? []);
      audio = `vo/${ep.id}/s${n}.mp3`;
    } catch {
      // no VO yet — keep a placeholder length so the scene can still be previewed
    }
    const frames = Math.ceil((dur + PAD) * FPS);
    scenes.push({ vo: ep.scenes[i].vo, visual: ep.scenes[i].visual as Visual, from, frames, audio, words });
    from += frames;
  }
  return {
    durationInFrames: from + OUTRO,
    props: { ...props, scenes, outroFrom: from },
  };
};

export const RemotionRoot: React.FC = () => (
  <>
    {month.episodes.map((ep) => (
      <Composition
        key={ep.id}
        id={ep.id}
        component={Episode}
        fps={FPS}
        width={W}
        height={H}
        durationInFrames={300}
        calculateMetadata={calc}
        defaultProps={{
          id: ep.id,
          channel: month.channel,
          category: ep.category,
          titleLines: ep.titleLines,
          keyword: ep.keyword,
          punchline: ep.punchline,
          scenes: [],
          outroFrom: 0,
          motionBlur: true,
        }}
      />
    ))}
  </>
);
