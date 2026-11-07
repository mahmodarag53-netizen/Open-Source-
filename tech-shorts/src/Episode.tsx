import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { BRAND, C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_TITLE, FONT_UI, FPS, setPalette } from "./theme";
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
  palette: string;
};

export const INTRO = 14; // frames of title before first VO
export const OUTRO = 84;
export const PAD = 0.32; // seconds of air after each VO line

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/* ---------- background: dotted engineer paper + film grain (far plane) ---------- */
const Paper: React.FC = () => {
  const f = useCurrentFrame();
  const x = Math.sin(f / 140) * 14;
  const y = (f * 0.25) % 48;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          inset: -120,
          backgroundImage: `radial-gradient(${C.grid} 3px, transparent 3.5px)`,
          backgroundSize: "48px 48px",
          transform: `translate(${x}px, ${-y}px)`,
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 8} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 50%, ${C.vignette} 100%)` }} />
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
      <div style={{ position: "absolute", left: -90 + p(50) * 26, top: 310 + p(70) * 30, width: 230, height: 230, borderRadius: "50%", background: C.olive, opacity: 0.85 * o, filter: "blur(8px)" }} />
      <div style={{ position: "absolute", right: -110 + p(60) * 22, top: 1180 + p(45) * 34, width: 260, height: 260, borderRadius: "50%", border: `10px solid ${C.blue}`, opacity: 0.85 * o, filter: "blur(6px)" }} />
      <div style={{ position: "absolute", right: -40 + p(40) * 18, top: 1240 + p(45) * 34, width: 120, height: 120, borderRadius: "50%", background: C.orange, opacity: 0.9 * o, filter: "blur(5px)" }} />
      <div style={{ position: "absolute", left: 70 + p(33) * 14, top: 1480 + p(28) * 18, width: 54, height: 54, borderRadius: "50%", border: `4px solid ${C.ink}`, opacity: 0.6 * o, filter: "blur(2.5px)" }} />
    </AbsoluteFill>
  );
};

/* ---------- frame, header, watermark (content protection) ---------- */
const Mark: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size, height: size, borderRadius: size * 0.28, background: C.orange, color: C.paper, display: "flex",
      justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size * 0.72,
      paddingBottom: size * 0.12, boxShadow: `${size * 0.08}px ${size * 0.08}px 0 ${C.shadow}`,
    }}
  >
    ؟
  </div>
);

const Frame: React.FC<{ p: EpisodeProps }> = ({ p }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 18);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 34, border: `3px solid ${C.ink}`, borderRadius: 26, opacity: 0.35 * o }} />
      <div style={{ position: "absolute", top: 66, left: 78, display: "flex", alignItems: "center", gap: 16, opacity: o, direction: "rtl" }}>
        <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 36, color: C.ink }}>{BRAND.series}</div>
        <Mark size={50} />
      </div>
      <div
        style={{
          position: "absolute", top: 70, right: 78, fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: C.orange,
          border: `3px solid ${C.orange}`, borderRadius: 999, padding: "4px 22px 8px", opacity: o, direction: "rtl",
        }}
      >
        {p.category}
      </div>
      {/* centred signature, sits on the picture so it can't be cropped out */}
      <div
        style={{
          position: "absolute", top: 1378, left: 0, right: 0, textAlign: "center", fontFamily: FONT_UI, fontSize: 30,
          color: C.dim, direction: "rtl", letterSpacing: 0.5, opacity: o * (1 - ease(f, p.outroFrom - 6, p.outroFrom + 6)),
        }}
      >
        {BRAND.series} · {BRAND.author}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- title: words land one by one ---------- */
const Title: React.FC<{ p: EpisodeProps }> = ({ p }) => {
  const f = useCurrentFrame();
  const kw = p.keyword.replace(/[؟?]/g, "");
  let k = 0;
  return (
    <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {p.titleLines.map((l, li) => (
        <div key={li} style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 100, lineHeight: 1.45, direction: "rtl", whiteSpace: "nowrap" }}>
          {l.split(" ").map((w, i) => {
            const at = 2 + k++ * 5;
            const o = ease(f, at, at + 14, EASE_OUT);
            const hit = kw.length > 1 && w.replace(/[؟?]/g, "").length > 1 && (kw.includes(w.replace(/[؟?]/g, "")) || w.includes(kw));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block", color: hit ? C.orange : C.ink, opacity: o, margin: "0 12px",
                  transform: `translateY(${(1 - o) * 50}px) scale(${0.9 + 0.1 * o})`, filter: `blur(${(1 - o) * 12}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
      <div style={{ marginTop: 10, height: 6, width: 200 * ease(f, 16, 40, EASE_IN_OUT), background: C.orange, borderRadius: 3 }} />
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
        <div style={{ filter: `drop-shadow(12px 14px 0 ${C.shadow})` }}>{children}</div>
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
    <div style={{ position: "absolute", left: 90, right: 90, top: 1440, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 16px", direction: "rtl", opacity: o }}>
      {chunk.map((w, i) => {
        const on = t >= w.start - 0.03;
        const active = on && t < w.end + 0.08;
        const r = ease(f, w.start * FPS - 3, w.start * FPS + 4, EASE_OUT);
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_UI, fontWeight: 600, fontSize: 60, lineHeight: 1.5, display: "inline-block",
              color: active ? C.orange : C.ink, opacity: r, transform: `translateY(${(1 - r) * 18}px)`,
              filter: `blur(${(1 - r) * 6}px)`, borderBottom: `5px solid ${active ? C.orange : "transparent"}`,
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
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 82, color: C.ink, direction: "rtl", textAlign: "center", lineHeight: 1.5,
          background: C.white, border: `7px solid ${C.ink}`, borderRadius: 34, padding: "34px 54px 50px", maxWidth: 900,
          boxShadow: `16px 16px 0 ${C.orange}`, transform: `scale(${interpolate(a, [0, 1], [0.7, 1])}) rotate(${(1 - a) * 4}deg)`,
          opacity: Math.min(1, a * 1.4), filter: `blur(${(1 - a) * 10}px)`,
        }}
      >
        {p.punchline}
      </div>
      <div style={{ marginTop: 90, display: "flex", alignItems: "center", gap: 26, direction: "rtl", opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        <Mark size={120} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 58, color: C.ink }}>{BRAND.series}</div>
          <div style={{ fontFamily: FONT_UI, fontSize: 34, color: C.inkSoft }}>إعداد وتقديم: {BRAND.author}</div>
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

export const Episode: React.FC<EpisodeProps> = (p) => {
  setPalette(p.palette);
  return (
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
};

export { EASE_BACK };
