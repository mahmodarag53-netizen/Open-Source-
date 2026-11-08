import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_TITLE } from "../theme";
import type { Word } from "../Episode";

/* ------------------------------------------------------------------ *
 * Ep01 · Scene 1 (flat editorial look, style C)
 * Line-art monitor on a desk that draws itself, app windows flood out,
 * FREEZE on «بيعلّق»: glass cracks, windows fall, shards fly → calm "؟".
 * 2D camera with parallax layers, punch-zoom and shake on the freeze.
 * ------------------------------------------------------------------ */

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Card: React.FC<{ kind: number; f: number; hot: number }> = ({ kind, f, hot }) => {
  const accent = kind % 2 ? C.orange : C.olive;
  return (
    <div style={{ width: 210, height: 150, borderRadius: 18, background: C.white, border: `5px solid ${C.ink}`, boxShadow: `9px 9px 0 ${hot > 0.5 ? C.orange : accent}`, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 7, padding: "9px 12px", borderBottom: `4px solid ${C.ink}`, background: hot > 0.5 ? C.orangeSoft : C.sand }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 11, height: 11, borderRadius: 6, background: k === 0 ? C.orange : C.inkSoft }} />)}
      </div>
      <div style={{ padding: 13, display: "flex", flexDirection: "column", gap: 9 }}>
        {kind === 2 ? (
          <div style={{ alignSelf: "center", marginTop: 8, width: 0, height: 0, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: `32px solid ${accent}` }} />
        ) : (
          [0, 1, 2].map((k) => (
            <div key={k} style={{ height: 11, borderRadius: 6, background: k === 0 ? accent : C.inkSoft, width: `${35 + ((Math.sin((f + k * 9 + kind * 7) / 6) + 1) / 2) * 55}%` }} />
          ))
        )}
      </div>
    </div>
  );
};

export const LagFlat: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const at = (needle: string, fallback: number) => {
    const w = words.find((x) => x.w.includes(needle));
    return w ? Math.round(w.start * fps) : fallback;
  };
  const FREEZE = at("بيعل", 84);
  const CALM = at("والجواب", 106);
  const frozen = f >= FREEZE;

  // draw-on timings
  const desk = ease(f, 0, 18, EASE_IN_OUT);
  const legs = ease(f, 8, 22, EASE_IN_OUT);
  const mon = ease(f, 10, 32, EASE_IN_OUT);
  const stand = ease(f, 18, 30, EASE_BACK);
  const on = ease(f, 30, 40);
  const icons = (i: number) => ease(f, 34 + i * 2, 44 + i * 2, EASE_BACK);
  const cursorT = ease(f, 38, 62, EASE_IN_OUT);
  const load = ease(f, 62, 70);
  const crack = ease(f, FREEZE, FREEZE + 14);
  const calm = ease(f, CALM, CALM + 16, EASE_BACK);

  // overload wobble before the freeze
  const stress = f < FREEZE ? ease(f, 64, FREEZE) : 0;
  const wob = stress * Math.sin(f * 1.9) * 2.2;

  // camera: slow push + punch zoom & shake on freeze, parallax layers
  const jolt = frozen ? Math.exp(-(f - FREEZE) / 6) : 0;
  const camS = lerp(0.94, 1.05, ease(f, 0, durationInFrames, EASE_IN_OUT)) + jolt * 0.07;
  const camX = Math.sin(f / 50) * 14 + jolt * Math.sin(f * 2.4) * 18;
  const camY = Math.cos(f / 60) * 8 + jolt * Math.cos(f * 2.1) * 12;
  const flash = frozen ? Math.max(0, 1 - (f - FREEZE) / 4) : 0;

  const CARDS = [
    { x: 120, y: 170, r: -8, kind: 0 },
    { x: 690, y: 150, r: 7, kind: 1 },
    { x: 60, y: 430, r: -5, kind: 2 },
    { x: 760, y: 410, r: 9, kind: 3 },
    { x: 400, y: 90, r: 3, kind: 1 },
    { x: 560, y: 520, r: -6, kind: 0 },
  ];

  const cracks = ["M500 450 L380 330", "M500 450 L300 470", "M500 450 L420 600", "M500 450 L600 620", "M500 450 L740 520", "M500 450 L690 330", "M500 450 L520 310", "M430 400 L390 460", "M590 520 L650 500"];

  return (
    <div style={{ position: "relative", width: 1000, height: 1000 }}>
      {/* far parallax layer */}
      <div style={{ position: "absolute", inset: 0, transform: `translate(${-camX * 0.4}px, ${-camY * 0.4}px) scale(${1 + (camS - 1) * 0.4})` }}>
        <div style={{ position: "absolute", left: 70, top: 120, width: 300, height: 300, borderRadius: "50%", border: `4px dashed ${C.grid}` }} />
        <div style={{ position: "absolute", right: 60, top: 600, width: 220, height: 220, borderRadius: "50%", background: C.sand, opacity: 0.7 }} />
        {["</>", "{ }", "01", "⚙"].map((t, i) => (
          <div key={i} style={{ position: "absolute", left: [120, 800, 860, 90][i], top: [700 - (f % 120) * 0.3, 120 + (f % 100) * 0.25, 360, 860][i], fontFamily: FONT_TITLE, fontSize: 54, color: C.grid, transform: `rotate(${Math.sin((f + i * 30) / 30) * 8}deg)` }}>
            {t}
          </div>
        ))}
      </div>

      {/* main layer */}
      <div style={{ position: "absolute", inset: 0, transform: `translate(${-camX}px, ${-camY}px) scale(${camS})` }}>
        <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="14" stroke={C.inkSoft} strokeWidth="4" />
            </pattern>
          </defs>
          {/* desk */}
          <rect x={110} y={760} width={780} height={34} rx={8} fill={C.sand} opacity={desk} />
          <path d="M100 760 H900" stroke={C.ink} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - desk} />
          <path d="M160 794 V960 M840 794 V960" stroke={C.ink} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - legs} />
          {/* hatched cast shadow */}
          <rect x={250} y={745} width={560} height={18} rx={9} fill="url(#hatch)" opacity={mon * 0.8} />
        </svg>

        {/* monitor group (wobbles when overloaded) */}
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${wob}deg)`, transformOrigin: "500px 760px" }}>
          <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* stand */}
            <g transform={`translate(500 760) scale(1 ${stand}) translate(-500 -760)`}>
              <rect x={470} y={640} width={60} height={100} fill={C.sand} stroke={C.ink} strokeWidth={8} />
              <rect x={390} y={736} width={220} height={26} rx={13} fill={C.white} stroke={C.ink} strokeWidth={8} />
            </g>
            {/* body + hard offset shadow */}
            <rect x={246} y={286} width={540} height={360} rx={26} fill={C.shadow} opacity={mon} />
            <rect x={230} y={270} width={540} height={360} rx={26} fill={C.white} stroke={C.ink} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - mon} fillOpacity={ease(f, 20, 32)} />
            {/* screen */}
            <rect x={258} y={298} width={484} height={304} rx={12} fill={frozen ? "#3B4E60" : C.oliveSoft} opacity={on} />
            <rect x={258} y={298} width={484} height={304} rx={12} fill={C.olive} opacity={on * (1 - on) * 2} />
            {/* scanline */}
            {!frozen && <rect x={258} y={298 + ((f * 8) % 300)} width={484} height={14} fill={C.olive} opacity={0.25 * on} />}
            {/* desktop icons */}
            {Array.from({ length: 6 }).map((_, i) => {
              const s = icons(i);
              const cx = 300 + (i % 2) * 60;
              const cy = 340 + Math.floor(i / 2) * 64;
              return <rect key={i} x={cx - 22 * s} y={cy - 22 * s} width={44 * s} height={44 * s} rx={10} fill={i % 3 === 0 ? C.orange : C.olive} stroke={C.ink} strokeWidth={4} />;
            })}
            {/* spinner */}
            <g transform={`translate(560 450) rotate(${frozen ? 130 : f * 15})`} opacity={load * (1 - calm)}>
              <circle r={42} fill="none" stroke={C.ink} strokeOpacity={0.25} strokeWidth={12} />
              <path d="M0 -42 A42 42 0 0 1 42 0" stroke={C.orange} strokeWidth={12} fill="none" strokeLinecap="round" />
            </g>
            {/* cracks */}
            {cracks.map((c, i) => (
              <path key={i} d={c} stroke={C.ink} strokeWidth={i < 7 ? 6 : 4} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(crack * 16, i * 0.7, i * 0.7 + 6)} />
            ))}
            {cracks.map((c, i) => (
              <path key={`w${i}`} d={c} stroke="#F1EEE5" strokeWidth={2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(crack * 16, i * 0.7, i * 0.7 + 6)} transform="translate(3 -3)" />
            ))}
          </svg>

          {/* stress badge */}
          <div
            style={{
              position: "absolute", left: 720, top: 210, width: 86, height: 86, borderRadius: "50%", background: C.orange, border: `6px solid ${C.ink}`,
              display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 60, color: C.paper,
              transform: `scale(${ease(f, 66, 76, EASE_BACK) * (1 - calm) * (1 + 0.12 * Math.sin(f / 2.2) * (frozen ? 0 : 1))}) rotate(${Math.sin(f / 3) * 10}deg)`,
              boxShadow: `6px 6px 0 ${C.shadow}`,
            }}
          >
            !
          </div>

          {/* calm answer */}
          <div
            style={{
              position: "absolute", left: 258, top: 298, width: 484, height: 304, display: "flex", justifyContent: "center", alignItems: "center",
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 210, color: C.orange, transform: `scale(${calm}) rotate(${(1 - calm) * -20}deg)`,
              textShadow: `8px 8px 0 ${C.ink}`, lineHeight: 1,
            }}
          >
            ؟
          </div>
        </div>

        {/* cursor gliding in and clicking */}
        {f < FREEZE + 2 && (
          <svg width={70} height={90} viewBox="0 0 70 90" style={{ position: "absolute", left: lerp(980, 560, cursorT) + Math.sin(f / 4) * 3 * stress, top: lerp(880, 470, cursorT), transform: `scale(${1 - 0.15 * Math.max(0, Math.sin(f / 3)) * load})`, opacity: ease(f, 36, 42) }}>
            <path d="M6 4 L6 70 L24 54 L36 84 L48 78 L36 50 L60 50 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          </svg>
        )}

        {/* windows flood out of the screen */}
        {CARDS.map((c, i) => {
          const t0 = 44 + i * 5;
          const pop = ease(f, t0, t0 + 14, EASE_BACK);
          if (pop <= 0.001) return null;
          const hot = ease(f, 64 + i * 2, 74 + i * 2);
          const jit = f < FREEZE ? hot * Math.sin(f * 2.3 + i) * 7 : 0;
          const ft = frozen ? Math.max(0, (f - FREEZE - 3) / 26) : 0;
          const fallY = ft * ft * 900;
          const spin = ft * (i % 2 ? 80 : -70);
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: lerp(395, c.x, pop) + jit, top: lerp(375, c.y, pop) + fallY,
                transform: `rotate(${c.r * pop + spin}deg) scale(${0.25 + 0.75 * pop})`, opacity: 1 - ease(f, FREEZE + 22, FREEZE + 34),
              }}
            >
              <Card kind={c.kind} f={frozen ? FREEZE : f} hot={hot} />
            </div>
          );
        })}

        {/* flat glass shards */}
        {frozen &&
          Array.from({ length: 16 }).map((_, i) => {
            const t = (f - FREEZE) / 22;
            const dx = (rnd(i) - 0.5) * 1000;
            const dy = (rnd(i + 20) - 0.75) * 700;
            const sz = 22 + rnd(i + 40) * 30;
            return (
              <div
                key={`s${i}`}
                style={{
                  position: "absolute", left: 500 + dx * t, top: 450 + dy * t + 500 * t * t, width: sz, height: sz,
                  clipPath: "polygon(50% 0, 100% 100%, 0 75%)", background: i % 3 === 0 ? C.orange : "#DCEBF5",
                  transform: `rotate(${t * 400 * (i % 2 ? 1 : -1)}deg)`, opacity: Math.max(0, 1 - t * 0.7),
                }}
              />
            );
          })}
      </div>

      {/* freeze flash */}
      <div style={{ position: "absolute", left: -400, right: -400, top: -500, bottom: -500, background: "radial-gradient(circle at 50% 45%, rgba(241,238,229,0.8) 0%, transparent 55%)", opacity: flash, pointerEvents: "none" }} />
    </div>
  );
};
