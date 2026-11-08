import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_HEAVY } from "../theme";
import type { Word } from "../Episode";

/* ------------------------------------------------------------------ *
 * Ep01 · Scene 1 — "ليش الكمبيوتر بيعلّق؟"
 * Fully code-built isometric monitor in real CSS 3D. Every part moves:
 * assemble → power on → app windows flood out → FREEZE on «بيعلّق» →
 * glass cracks, shards burst, windows fall → calm "؟".
 * ------------------------------------------------------------------ */

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const P3: React.CSSProperties = { position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d" };

type BoxProps = {
  w: number; h: number; d: number;
  x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; s?: number;
  front?: string; top?: string; side?: string; edge?: string; glow?: number; opacity?: number;
  frontContent?: React.ReactNode; topContent?: React.ReactNode;
};

/** A solid 3D box: six faces, shaded by orientation, neon edges. */
const Box: React.FC<BoxProps> = ({
  w, h, d, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1,
  front = "#13233C", top = "#1C3355", side = "#0C1729", edge = C.olive, glow = 1, opacity = 1,
  frontContent, topContent,
}) => {
  const face = (fw: number, fh: number, t: string, bg: string, content?: React.ReactNode, bright = false): React.ReactNode => (
    <div
      style={{
        position: "absolute", left: -fw / 2, top: -fh / 2, width: fw, height: fh, transform: t, background: bg,
        border: `2px solid ${edge}`, boxShadow: bright ? `0 0 ${24 * glow}px ${C.glow}, inset 0 0 ${30 * glow}px rgba(63,211,240,0.18)` : `inset 0 0 20px rgba(0,0,0,0.35)`,
        backfaceVisibility: "hidden", overflow: "hidden",
      }}
    >
      {content}
    </div>
  );
  return (
    <div style={{ ...P3, opacity, transform: `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})` }}>
      {face(w, h, `translateZ(${d / 2}px)`, front, frontContent, true)}
      {face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, side)}
      {face(d, h, `rotateY(90deg) translateZ(${w / 2}px)`, side)}
      {face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, side)}
      {face(w, d, `rotateX(90deg) translateZ(${h / 2}px)`, top, topContent, true)}
      {face(w, d, `rotateX(-90deg) translateZ(${h / 2}px)`, side)}
    </div>
  );
};

/** Circuit traces drawn on the platform's top face. */
const Circuit: React.FC<{ d: number; f: number }> = ({ d, f }) => {
  const paths = [
    "M20 260 H200 L240 220 H380", "M20 200 H140 L180 160 H330", "M740 120 H560 L520 160 H400",
    "M740 300 H600 L560 340 H420", "M380 20 V120 L420 160", "M300 500 V400 L340 360 H380",
    "M500 500 V420 L460 380", "M60 60 H160 L200 100", "M700 460 H600 L570 430",
  ];
  return (
    <svg width={760} height={520} viewBox="0 0 760 520" style={{ position: "absolute", inset: 0 }}>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p} stroke={i % 3 ? C.olive : C.orange} strokeWidth={4} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(d * 40, i * 2, i * 2 + 18, EASE_IN_OUT)} opacity={0.85} />
        </g>
      ))}
      {/* current pulses travelling along traces */}
      {d > 0.8 &&
        paths.slice(0, 6).map((_, i) => {
          const t = ((f + i * 13) % 60) / 60;
          return <circle key={`p${i}`} cx={lerp(20, 380, t)} cy={[260, 200, 120, 300, 70, 450][i]} r={6} fill={C.white} opacity={Math.sin(t * Math.PI) * 0.8} />;
        })}
    </svg>
  );
};

/** Glass app window with a little live UI. */
const AppWindow: React.FC<{ kind: number; f: number; hot: number }> = ({ kind, f, hot }) => {
  const accent = kind % 2 ? C.orange : C.olive;
  return (
    <div
      style={{
        width: 230, height: 160, borderRadius: 16, overflow: "hidden",
        background: "linear-gradient(160deg, rgba(40,70,110,0.78), rgba(12,24,44,0.9))",
        border: `2px solid ${hot > 0.5 ? C.orange : accent}`,
        boxShadow: `0 0 ${26 + hot * 30}px ${hot > 0.5 ? C.glow2 : C.glow}`,
      }}
    >
      <div style={{ display: "flex", gap: 7, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 10, height: 10, borderRadius: 5, background: k === 0 && hot > 0.5 ? C.orange : C.inkSoft }} />)}
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {kind === 2 ? (
          <div style={{ alignSelf: "center", width: 0, height: 0, borderTop: "22px solid transparent", borderBottom: "22px solid transparent", borderLeft: `36px solid ${accent}`, marginTop: 14 }} />
        ) : (
          [0, 1, 2].map((k) => (
            <div key={k} style={{ height: 10, borderRadius: 5, background: k === 0 ? accent : "rgba(228,238,249,0.35)", width: `${40 + ((Math.sin((f + k * 9 + kind * 7) / 6) + 1) / 2) * 50}%` }} />
          ))
        )}
      </div>
    </div>
  );
};

/** What the monitor screen shows. */
const ScreenUI: React.FC<{ f: number; on: number; load: number; frozen: number; crack: number; calm: number }> = ({ f, on, load, frozen, crack, calm }) => {
  const scan = ((f * 9) % 400) - 40;
  const cracks = [
    "M250 150 L120 40", "M250 150 L60 170", "M250 150 L150 300", "M250 150 L330 330", "M250 150 L470 260",
    "M250 150 L430 30", "M250 150 L260 0", "M180 100 L140 160", "M330 230 L400 200", "M200 230 L230 300",
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: on }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${frozen > 0.5 ? "#2A3A4E" : "#17406A"} 0%, #0A1426 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 30, background: "linear-gradient(transparent, rgba(63,211,240,0.25), transparent)", opacity: 1 - frozen }} />
      {/* desktop icons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 26 + (i % 2) * 54, top: 24 + Math.floor(i / 2) * 58, width: 38, height: 38, borderRadius: 9, background: i % 3 === 0 ? C.orange : C.olive, opacity: 0.75 * ease(on * 30, i * 3, i * 3 + 10) }} />
      ))}
      {/* loading spinner */}
      <div
        style={{
          position: "absolute", left: "50%", top: "46%", width: 76, height: 76, marginLeft: -38, marginTop: -38, borderRadius: "50%",
          border: `9px solid rgba(228,238,249,0.15)`, borderTopColor: C.orange, transform: `rotate(${frozen > 0.5 ? 140 : f * 14}deg)`,
          opacity: load * (1 - calm),
        }}
      />
      {/* frozen tint + cracks */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(200,220,240,0.10)", opacity: frozen * (1 - calm * 0.6) }} />
      <svg width="100%" height="100%" viewBox="0 0 500 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        {cracks.map((c, i) => (
          <path key={i} d={c} stroke="#E8F6FF" strokeWidth={i < 7 ? 3 : 2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(crack * 20, i * 0.8, i * 0.8 + 6)} opacity={0.9 - calm * 0.4} style={{ filter: `drop-shadow(0 0 4px ${C.olive})` }} />
        ))}
      </svg>
      {/* calm answer */}
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 170, color: C.orange, opacity: calm, transform: `scale(${0.6 + 0.4 * calm})`, textShadow: `0 0 40px ${C.glow2}` }}>
        ؟
      </div>
    </div>
  );
};

export const LagScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const at = (needle: string, fallback: number) => {
    const w = words.find((x) => x.w.includes(needle));
    return w ? Math.round(w.start * fps) : fallback;
  };
  const FREEZE = at("بيعل", 84);
  const CALM = at("والجواب", 106);

  // ----- build-up -----
  const plat = ease(f, 0, 22);
  const neck = ease(f, 10, 28, EASE_BACK);
  const scr = ease(f, 16, 40, EASE_BACK);
  const on = ease(f, 38, 52);
  const load = ease(f, 60, 70);
  const frozen = f >= FREEZE ? 1 : 0;
  const crack = ease(f, FREEZE, FREEZE + 16, EASE_OUT);
  const calm = ease(f, CALM, CALM + 18, EASE_IN_OUT);

  // ----- camera: continuous orbit + jolt at freeze -----
  const jolt = f >= FREEZE ? Math.exp(-(f - FREEZE) / 7) : 0;
  const orbit = lerp(-40, -16, ease(f, 0, durationInFrames, EASE_IN_OUT)) + jolt * Math.sin((f - FREEZE) * 1.6) * 6;
  const tilt = -22 + Math.sin(f / 40) * 2;
  const push = lerp(-260, -60, ease(f, 0, durationInFrames, EASE_IN_OUT));
  const shakeX = jolt * Math.sin(f * 2.3) * 14;
  const shakeY = jolt * Math.cos(f * 1.9) * 10;
  const flash = f >= FREEZE ? Math.max(0, 1 - (f - FREEZE) / 4) : 0;

  // ----- windows -----
  const WIN = [
    { x: -250, y: -210, z: 120, ry: 18, kind: 0 },
    { x: 230, y: -230, z: 160, ry: -14, kind: 1 },
    { x: -300, y: 20, z: 200, ry: 22, kind: 2 },
    { x: 280, y: -10, z: 230, ry: -20, kind: 3 },
    { x: -40, y: -300, z: 260, ry: 6, kind: 1 },
    { x: 60, y: 80, z: 300, ry: -8, kind: 0 },
  ];

  return (
    <div style={{ position: "relative", width: 1080, height: 1000, perspective: 1900, perspectiveOrigin: "50% 38%" }}>
      {/* far plane: drifting code chips, defocused */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={`bg${i}`}
          style={{
            position: "absolute", left: 80 + rnd(i) * 900, top: 80 + rnd(i + 9) * 760 - ((f * (0.6 + rnd(i + 3))) % 200), width: 120 + rnd(i + 4) * 80, height: 14,
            borderRadius: 7, background: i % 2 ? C.olive : C.orange, opacity: 0.18, filter: "blur(5px)",
          }}
        />
      ))}

      <div style={{ ...P3, left: "50%", top: "43%", transform: `scale(1.22) translate3d(${shakeX}px,${shakeY}px,${push}px) rotateX(${tilt}deg) rotateY(${orbit}deg)` }}>
        {/* platform */}
        <Box w={760} h={46} d={520} y={lerp(700, 250, plat)} opacity={plat} topContent={<Circuit d={plat} f={f} />} top="#12223B" front="#0F1D33" />
        {/* stand */}
        <Box w={230} h={16} d={140} y={219} s={neck} opacity={neck} />
        <Box w={46} h={130 * neck} d={34} y={211 - (130 * neck) / 2} z={-24} opacity={neck} />
        {/* monitor */}
        <Box
          w={560} h={340} d={26}
          x={0} y={lerp(-760, -62, scr)} z={-6} rx={-6} rz={lerp(-18, 0, scr)} ry={lerp(50, 0, scr)}
          opacity={Math.min(1, scr * 1.5)}
          front="#0A1426" edge={frozen ? C.orange : C.olive} glow={1 + flash * 2}
          frontContent={<ScreenUI f={f} on={on} load={load} frozen={frozen} crack={crack} calm={calm} />}
        />

        {/* app windows flood out of the screen */}
        {WIN.map((w, i) => {
          const t0 = 44 + i * 6;
          const pop = ease(f, t0, t0 + 14, EASE_BACK);
          const hot = ease(f, 64 + i * 2, 76 + i * 2);
          const jit = f < FREEZE ? hot * Math.sin(f * 2.1 + i) * 6 : 0;
          const fall = f >= FREEZE + 4 ? (f - FREEZE - 4) / 30 : 0;
          const fallY = fall * fall * 620;
          const fallR = fall * (i % 2 ? 70 : -60);
          const gone = ease(f, FREEZE + 20, FREEZE + 40);
          if (pop <= 0.001) return null;
          return (
            <div
              key={i}
              style={{
                ...P3,
                transform: `translate3d(${lerp(0, w.x, pop) + jit}px,${lerp(-62, w.y, pop) + fallY}px,${lerp(0, w.z, pop)}px) rotateY(${w.ry}deg) rotateZ(${fallR}deg) scale(${0.3 + 0.7 * pop})`,
                opacity: Math.min(1, pop * 1.4) * (1 - gone),
              }}
            >
              <div style={{ position: "absolute", left: -115, top: -80 }}>
                <AppWindow kind={w.kind} f={f} hot={hot} />
              </div>
            </div>
          );
        })}

        {/* glass shards burst from the impact point */}
        {f >= FREEZE &&
          Array.from({ length: 18 }).map((_, i) => {
            const t = (f - FREEZE) / 24;
            const dx = (rnd(i) - 0.5) * 900;
            const dy = (rnd(i + 20) - 0.7) * 600;
            const dz = 120 + rnd(i + 40) * 520;
            const sz = 18 + rnd(i + 60) * 34;
            const o = Math.max(0, 1 - t * 0.55);
            return (
              <div
                key={`s${i}`}
                style={{
                  ...P3,
                  transform: `translate3d(${-40 + dx * t}px,${-90 + dy * t + 260 * t * t}px,${dz * t}px) rotate3d(${rnd(i + 1)},${rnd(i + 2)},${rnd(i + 3)},${t * 540}deg)`,
                  opacity: o,
                }}
              >
                <div
                  style={{
                    width: sz, height: sz * 0.8, clipPath: "polygon(50% 0, 100% 100%, 0 70%)",
                    background: i % 3 === 0 ? C.orange : "linear-gradient(135deg, rgba(220,245,255,0.95), rgba(63,211,240,0.6))",
                    boxShadow: `0 0 18px ${C.glow}`,
                  }}
                />
              </div>
            );
          })}
      </div>

      {/* freeze flash */}
      <div style={{ position: "absolute", left: -400, right: -400, top: -500, bottom: -500, background: "radial-gradient(circle at 50% 45%, rgba(221,246,255,0.75) 0%, rgba(63,211,240,0.25) 30%, transparent 60%)", opacity: flash, pointerEvents: "none" }} />
    </div>
  );
};
