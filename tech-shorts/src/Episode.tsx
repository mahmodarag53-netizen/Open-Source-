import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { BRAND, C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_HEAVY, FONT_UI, FPS, setPalette } from "./theme";
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

/* ---------- background: night navy, perspective circuit floor, grain (far plane) ---------- */
const Paper: React.FC = () => {
  const f = useCurrentFrame();
  const drift = (f * 1.6) % 90;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #12233D 0%, ${C.paper} 62%)`, overflow: "hidden" }}>
      {/* receding floor grid — real 3D plane */}
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 30%" }}>
        <div
          style={{
            position: "absolute", left: -1400, right: -1400, top: 980, height: 2600,
            transform: `rotateX(72deg) translateY(${drift}px)`, transformOrigin: "50% 0",
            backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
            backgroundSize: "90px 90px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%)",
          }}
        />
      </AbsoluteFill>
      {/* horizon glow */}
      <div style={{ position: "absolute", left: -200, right: -200, top: 930, height: 260, background: `radial-gradient(ellipse at 50% 50%, ${C.glow} 0%, transparent 65%)`, opacity: 0.35 }} />
      {/* drifting data dust, far → defocused */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 397) % 1080;
        const y = (1900 - ((f * (0.6 + (i % 5) * 0.25) + i * 211) % 2000));
        const s = 3 + (i % 4) * 2;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: i % 3 ? C.olive : C.orange, opacity: 0.25 + (i % 4) * 0.12, filter: `blur(${(i % 4) * 1.2}px)` }} />;
      })}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("fx/grain.png")})`, backgroundSize: "512px 512px",
          backgroundPosition: `${(f * 137) % 512}px ${(f * 251) % 512}px`, opacity: 0.07, mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 45%, ${C.vignette} 100%)` }} />
    </AbsoluteFill>
  );
};

/* ---------- near plane: big defocused neon bokeh (closest to camera) ---------- */
const NearPlane: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 6, 30);
  const p = (k: number) => Math.sin(f / k);
  const bokeh = (left: number, top: number, size: number, color: string, _blur: number, alpha: number) => (
    <div style={{ position: "absolute", left, top, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, opacity: alpha * o }} />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {bokeh(-120 + p(50) * 30, 360 + p(70) * 30, 300, C.olive, 14, 0.45)}
      {bokeh(860 + p(60) * 26, 1150 + p(45) * 34, 320, C.orange, 16, 0.35)}
      {bokeh(60 + p(33) * 20, 1560 + p(28) * 18, 140, C.olive, 8, 0.5)}
    </AbsoluteFill>
  );
};

/* ---------- logo, header, watermark (content protection) ---------- */
const MicGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={34} y={8} width={32} height={54} rx={16} fill="none" stroke={color} strokeWidth={7} />
    <path d="M38 24 H62 M38 36 H62 M38 48 H62" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M22 46 A28 28 0 0 0 78 46 M50 74 V92 M36 92 H64" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
  </svg>
);

export const Logo: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 * scale, direction: "rtl" }}>
    <div style={{ fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 40 * scale, lineHeight: 1.05, color: C.title, textShadow: `0 0 ${18 * scale}px ${C.glow2}` }}>
      طيب
      <br />
      شلون؟
    </div>
    <div style={{ filter: `drop-shadow(0 0 ${10 * scale}px ${C.glow2})` }}>
      <MicGlyph size={78 * scale} color={C.orange} />
    </div>
  </div>
);

const Frame: React.FC<{ p: EpisodeProps }> = ({ p }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 18);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 30, border: `2px solid ${C.olive}`, borderRadius: 34, opacity: 0.22 * o, boxShadow: `inset 0 0 60px ${C.glow}` }} />
      <div style={{ position: "absolute", top: 58, left: 70, opacity: o }}>
        <Logo scale={0.62} />
      </div>
      <div
        style={{
          position: "absolute", top: 72, right: 72, fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: C.olive,
          background: "rgba(63,211,240,0.08)", border: `2px solid ${C.olive}`, borderRadius: 999, padding: "4px 24px 8px",
          opacity: o, direction: "rtl", boxShadow: `0 0 18px ${C.glow}`,
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
    <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {p.titleLines.map((l, li) => (
        <div key={li} style={{ fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 108, lineHeight: 1.35, direction: "rtl", whiteSpace: "nowrap" }}>
          {l.split(" ").map((w, i) => {
            const at = 2 + k++ * 5;
            const o = ease(f, at, at + 14, EASE_OUT);
            const hit = kw.length > 1 && w.replace(/[؟?]/g, "").length > 1 && (kw.includes(w.replace(/[؟?]/g, "")) || w.includes(kw));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block", color: hit ? C.orange : C.title, opacity: o, margin: "0 12px",
                  textShadow: `0 0 26px ${hit ? C.glow2 : "rgba(238,221,166,0.25)"}, 0 6px 0 rgba(0,0,0,0.45)`,
                  transform: `translateY(${(1 - o) * 50}px) scale(${0.9 + 0.1 * o})`, filter: `blur(${(1 - o) * 12}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
      
    </div>
  );
};

/* ---------- scene camera: rack focus in, slow push, defocus out ---------- */
const SceneCam: React.FC<{ frames: number; bake?: boolean; children: React.ReactNode }> = ({ frames, bake, children }) => {
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
          filter: blur > 0.3 ? `blur(${blur}px)` : "none", opacity: Math.min(inn * 1.6, 1 - out),
        }}
      >
        <div style={{ filter: bake ? "none" : `drop-shadow(0 0 22px ${C.glow}) drop-shadow(0 30px 30px ${C.shadow})` }}>{children}</div>
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
              color: active ? C.orange : C.title, opacity: r, textShadow: active ? `0 0 18px ${C.glow2}` : "none", transform: `translateY(${(1 - r) * 18}px)`,
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
          fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 96, color: C.title, direction: "rtl", textAlign: "center", lineHeight: 1.35,
          maxWidth: 940, padding: "40px 50px 56px", borderRadius: 40,
          background: "linear-gradient(160deg, rgba(30,52,84,0.75), rgba(10,20,36,0.85))",
          border: `2px solid ${C.olive}`, boxShadow: `0 0 50px ${C.glow}, inset 0 0 40px rgba(63,211,240,0.12)`,
          textShadow: `0 0 30px ${C.glow2}`,
          transform: `perspective(1400px) rotateX(${(1 - a) * 18}deg) scale(${interpolate(a, [0, 1], [0.75, 1])})`,
          opacity: Math.min(1, a * 1.4), filter: `blur(${(1 - a) * 10}px)`,
        }}
      >
        {p.punchline}
      </div>
      <div style={{ marginTop: 110, width: 900, display: "flex", justifyContent: "space-between", alignItems: "center", direction: "rtl", opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontFamily: FONT_UI, fontWeight: 600, fontSize: 34, color: C.ink, border: `2px solid ${C.ink}`, borderRadius: 999,
              padding: "8px 34px 12px", opacity: 0.85,
            }}
          >
            تابعونا للمزيد
          </div>
          <div style={{ fontFamily: FONT_UI, fontSize: 30, color: C.inkSoft, textAlign: "center" }}>إعداد وتقديم: {BRAND.author}</div>
        </div>
        <Logo scale={1.25} />
      </div>
    </AbsoluteFill>
  );
};

const Body: React.FC<{ p: EpisodeProps }> = ({ p }) => (
  <AbsoluteFill>
    <Paper />
    {p.scenes.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.frames} name={`مشهد ${i + 1}`}>
        <SceneCam frames={s.frames} bake={s.visual.type === "asset"}>
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
      <CameraMotionBlur shutterAngle={180} samples={4}>
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
