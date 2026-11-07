import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_TITLE, FONT_UI, FPS } from "./theme";
import { Visual, VisualView } from "./visuals";

export type Word = { w: string; start: number; end: number };
export type SceneT = { vo: string; visual: Visual; from: number; frames: number; audio: string | null; words: Word[] };
export type EpisodeProps = {
  id: string;
  channel: { name: string; handle: string };
  category: string;
  titleLines: string[];
  keyword: string;
  punchline: string;
  scenes: SceneT[];
  outroFrom: number;
  motionBlur: boolean;
};

export const INTRO = 14; // frames of title before first VO
export const OUTRO = 84;
export const PAD = 0.32; // seconds of air after each VO line

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/* ---------- background: grid paper (far plane) ---------- */
const Paper: React.FC = () => {
  const f = useCurrentFrame();
  const x = Math.sin(f / 140) * 14;
  const y = (f * 0.25) % 54;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          inset: -120,
          backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
          backgroundSize: "54px 54px",
          transform: `translate(${x}px, ${-y}px)`,
          filter: "blur(0.6px)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(120,95,60,0.16) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- foreground decorations (near plane, defocused) ---------- */
const NearPlane: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 6, 30);
  const p = (k: number) => Math.sin(f / k);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: -90 + p(50) * 26, top: 310 + p(70) * 30, width: 230, height: 230, borderRadius: "50%", background: C.orange, opacity: 0.9 * o, filter: "blur(7px)" }} />
      <div style={{ position: "absolute", right: -110 + p(60) * 22, top: 1180 + p(45) * 34, width: 260, height: 260, borderRadius: "50%", border: `10px solid ${C.olive}`, opacity: 0.85 * o, filter: "blur(6px)" }} />
      <div style={{ position: "absolute", right: -40 + p(40) * 18, top: 1240 + p(45) * 34, width: 120, height: 120, borderRadius: "50%", background: C.oliveSoft, opacity: o, filter: "blur(5px)" }} />
      <div style={{ position: "absolute", left: 70 + p(33) * 14, top: 1480 + p(28) * 18, width: 54, height: 54, borderRadius: "50%", border: `4px solid ${C.ink}`, opacity: 0.6 * o, filter: "blur(2.5px)" }} />
    </AbsoluteFill>
  );
};

/* ---------- frame + header ---------- */
const Frame: React.FC<{ p: EpisodeProps }> = ({ p }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 18);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 34, border: `3px solid ${C.ink}`, opacity: 0.75 * o }} />
      <div style={{ position: "absolute", inset: 46, border: `2px solid ${C.inkSoft}`, opacity: 0.5 * o }} />
      <div style={{ position: "absolute", top: 74, left: 84, fontFamily: FONT_UI, fontSize: 34, color: C.inkSoft, opacity: o, direction: "rtl" }}>{p.channel.name}</div>
      <div style={{ position: "absolute", top: 74, right: 84, fontFamily: FONT_UI, fontWeight: 600, fontSize: 34, color: C.orange, opacity: o, direction: "rtl" }}>{p.category}</div>
    </AbsoluteFill>
  );
};

/* ---------- title ---------- */
const Title: React.FC<{ p: EpisodeProps }> = ({ p }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = ease(f, p.outroFrom, p.outroFrom + 16, EASE_IN_OUT);
  const renderLine = (line: string) =>
    line.split(" ").map((w, i) => {
      const hit = p.keyword.split(" ").some((k) => w.includes(k.replace(/[؟?]/g, "")) && k.replace(/[؟?]/g, "").length > 1);
      return (
        <span key={i} style={{ color: hit ? C.orange : C.ink }}>
          {w}
          {i < line.split(" ").length - 1 ? " " : ""}
        </span>
      );
    });
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out * 0.0, transform: `translateY(${-out * 20}px)` }}>
      {p.titleLines.map((l, i) => {
        const o = ease(f, i * 6, i * 6 + 22, EASE_OUT);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 104, lineHeight: 1.45, direction: "rtl", whiteSpace: "nowrap",
              opacity: o, transform: `translateY(${(1 - o) * 60}px)`, filter: `blur(${(1 - o) * 14}px)`,
            }}
          >
            {renderLine(l)}
          </div>
        );
      })}
      <div style={{ marginTop: 8, height: 5, width: 220 * ease(f, 14, 38, EASE_IN_OUT), background: C.ink, borderRadius: 3 }} />
      {durationInFrames < 0 && null}
    </div>
  );
};

/* ---------- scene camera: rack focus in, slow push, defocus out ---------- */
const SceneCam: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const inn = ease(f, 0, 18, EASE_OUT);
  const out = ease(f, frames - 10, frames, EASE_IN_OUT);
  const push = interpolate(f, [0, frames], [1, 1.045], { easing: EASE_IN_OUT, extrapolateRight: "clamp" });
  const scale = push * interpolate(inn, [0, 1], [1.18, 1]) * interpolate(out, [0, 1], [1, 0.88]);
  const blur = (1 - inn) * 16 + out * 14;
  const z = interpolate(inn, [0, 1], [90, 0]) - out * 70;
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <AbsoluteFill
        style={{
          justifyContent: "center", alignItems: "center", top: 470, bottom: 470, height: "auto",
          transform: `translateZ(${z}px) scale(${scale}) rotateX(${(1 - inn) * 8}deg)`,
          filter: `blur(${blur}px)`, opacity: Math.min(inn * 1.6, 1 - out),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- captions: word-by-word highlight ---------- */
const Captions: React.FC<{ words: Word[]; frames: number }> = ({ words, frames }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (!words.length) return null;
  // chunk into groups of ≤5 words, breaking after punctuation
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= 5 || /[،.؟!]$/.test(w.w)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const idx = Math.max(0, chunks.findIndex((c) => t < c[c.length - 1].end + 0.05));
  const chunk = chunks[idx === -1 ? chunks.length - 1 : idx];
  const cStart = chunk[0].start * FPS;
  const o = ease(f, cStart - 2, cStart + 6) * (1 - ease(f, frames - 8, frames));
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1450, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 16px", direction: "rtl", opacity: o }}>
      {chunk.map((w, i) => {
        const on = t >= w.start - 0.02;
        const active = on && t < w.end + 0.06;
        const pop = ease(f, w.start * FPS - 2, w.start * FPS + 5, EASE_BACK);
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_UI, fontWeight: 600, fontSize: 58, lineHeight: 1.5,
              color: active ? C.white : on ? C.ink : "rgba(43,38,34,0.35)",
              background: active ? C.orange : "transparent", borderRadius: 14, padding: "0 14px 6px",
              transform: `scale(${active ? 1 + 0.06 * pop : 1})`, display: "inline-block",
            }}
          >
            {w.w.replace(/[،.]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- outro: punchline + logo ---------- */
const Outro: React.FC<{ p: EpisodeProps }> = ({ p }) => {
  const f = useCurrentFrame();
  const a = ease(f, 0, 20, EASE_BACK);
  const b = ease(f, 14, 34, EASE_OUT);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: 300 }}>
      <div
        style={{
          fontFamily: FONT_TITLE, fontSize: 82, color: C.ink, direction: "rtl", textAlign: "center", lineHeight: 1.5,
          background: C.white, border: `7px solid ${C.ink}`, borderRadius: 34, padding: "34px 54px 50px", maxWidth: 900,
          boxShadow: `16px 16px 0 ${C.orange}`, transform: `scale(${interpolate(a, [0, 1], [0.7, 1])}) rotate(${(1 - a) * 4}deg)`,
          opacity: Math.min(1, a * 1.4), filter: `blur(${(1 - a) * 10}px)`,
        }}
      >
        {p.punchline}
      </div>
      <div style={{ marginTop: 90, display: "flex", alignItems: "center", gap: 26, direction: "rtl", opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: C.white, border: `6px solid ${C.ink}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontSize: 84, color: C.ink, paddingBottom: 14 }}>
          ؟
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: FONT_TITLE, fontSize: 58, color: C.ink }}>{p.channel.name}</div>
          <div style={{ fontFamily: FONT_UI, fontSize: 34, color: C.inkSoft, direction: "ltr", textAlign: "right" }}>{p.channel.handle}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Body: React.FC<{ p: EpisodeProps }> = ({ p }) => (
  <AbsoluteFill>
    <Paper />
    {p.scenes.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.frames} name={`مشهد ${i + 1}`}>
        <SceneCam frames={s.frames}>
          <VisualView v={s.visual} />
        </SceneCam>
        <Captions words={s.words} frames={s.frames} />
      </Sequence>
    ))}
    <Sequence from={p.outroFrom} name="الخاتمة">
      <Outro p={p} />
    </Sequence>
    <Title p={p} />
    <Frame p={p} />
    <NearPlane />
  </AbsoluteFill>
);

export const Episode: React.FC<EpisodeProps> = (p) => (
  <AbsoluteFill>
    {p.motionBlur ? (
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <Body p={p} />
      </CameraMotionBlur>
    ) : (
      <Body p={p} />
    )}
    {/* Track A1 — voiceover, one clip per scene */}
    {p.scenes.map((s, i) =>
      s.audio ? (
        <Sequence key={i} from={s.from} durationInFrames={s.frames} name={`VO ${i + 1}`} layout="none">
          <Audio src={staticFile(s.audio)} />
        </Sequence>
      ) : null,
    )}
    {/* Track A2 — SFX and A3 — music are left empty on purpose; see public/cues/<id>.csv for markers. */}
  </AbsoluteFill>
);

export { EASE_BACK };
