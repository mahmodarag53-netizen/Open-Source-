import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_TITLE, FONT_UI } from "../theme";
import type { Word } from "../Episode";

/* ======================================================================
 * Ep01 scenes 2–6 — flat editorial look (style C), everything animated,
 * every beat cued to the voice-over word timings.
 * One continuous world: the same desk (RAM) and cabinet (HDD).
 * ==================================================================== */

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const useCue = (words: Word[]) => {
  const { fps } = useVideoConfig();
  return (needle: string, fallback: number) => {
    const w = words.find((x) => x.w.includes(needle));
    return w ? Math.round(w.start * fps) : fallback;
  };
};

/* ---------------- shared building blocks ---------------- */

/** Camera rig: far parallax layer + main layer, slow push, optional punch. */
const Rig: React.FC<{ s: number; x: number; y: number; children: React.ReactNode }> = ({ s, x, y, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: 1000, height: 1000 }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${-x * 0.4}px, ${-y * 0.4}px) scale(${1 + (s - 1) * 0.4})` }}>
        <div style={{ position: "absolute", left: 60, top: 110, width: 300, height: 300, borderRadius: "50%", border: `4px dashed ${C.grid}` }} />
        <div style={{ position: "absolute", right: 50, top: 620, width: 220, height: 220, borderRadius: "50%", background: C.sand, opacity: 0.6 }} />
        {["</>", "{ }", "01", "⚙"].map((t, i) => (
          <div key={i} style={{ position: "absolute", left: [110, 820, 870, 80][i], top: [700, 110, 380, 870][i] - ((f * (0.3 + i * 0.1)) % 60), fontFamily: FONT_TITLE, fontSize: 54, color: C.grid, transform: `rotate(${Math.sin((f + i * 30) / 30) * 8}deg)` }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${-x}px, ${-y}px) scale(${s})` }}>{children}</div>
    </div>
  );
};

const HATCH = (
  <defs>
    <pattern id="hatch2" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="14" stroke={C.inkSoft} strokeWidth="4" />
    </pattern>
  </defs>
);

/** The work desk (= RAM). `w` = top width, centred on cx. */
const Desk: React.FC<{ cx: number; top: number; w: number; draw: number; tint?: number }> = ({ cx, top, w, draw, tint = 0 }) => (
  <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    {HATCH}
    <rect x={cx - w / 2 + 14} y={top + 40} width={w - 28} height={18} rx={9} fill="url(#hatch2)" opacity={draw * 0.8} />
    <rect x={cx - w / 2} y={top} width={w} height={38} rx={10} fill={tint > 0 ? C.orangeSoft : C.sand} opacity={draw} />
    <path d={`M${cx - w / 2 - 10} ${top} H${cx + w / 2 + 10}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d={`M${cx - w / 2 + 40} ${top + 38} V${top + 230} M${cx + w / 2 - 40} ${top + 38} V${top + 230}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(draw, 0.4, 1)} />
  </svg>
);

/** Small program "toolbox" card that sits on the desk. */
const Tool: React.FC<{ kind: number; hot?: number }> = ({ kind, hot = 0 }) => {
  const accent = [C.olive, C.orange, C.blue, C.olive][kind % 4];
  return (
    <div style={{ width: 120, height: 86, borderRadius: 14, background: C.white, border: `5px solid ${C.ink}`, boxShadow: `7px 7px 0 ${hot > 0.5 ? C.orange : accent}`, overflow: "hidden" }}>
      <div style={{ height: 20, background: hot > 0.5 ? C.orangeSoft : C.sand, borderBottom: `4px solid ${C.ink}`, display: "flex", gap: 5, padding: "4px 7px" }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 7, height: 7, borderRadius: 4, background: k === 0 ? C.orange : C.inkSoft }} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 56 }}>
        {kind % 4 === 0 && <div style={{ width: 34, height: 34, borderRadius: 17, border: `6px solid ${accent}` }} />}
        {kind % 4 === 1 && <div style={{ width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: `26px solid ${accent}` }} />}
        {kind % 4 === 2 && <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: accent }}>{"</>"}</div>}
        {kind % 4 === 3 && <div style={{ width: 40, height: 28, background: accent, borderRadius: 4 }} />}
      </div>
    </div>
  );
};

/** Hanging sign on a rope that drops and swings. */
const Sign: React.FC<{ text: string; x: number; y: number; t0: number; accent?: boolean }> = ({ text, x, y, t0, accent }) => {
  const f = useCurrentFrame();
  const d = ease(f, t0, t0 + 16, EASE_BACK);
  if (f < t0) return null;
  const swing = Math.sin((f - t0) / 4) * 9 * Math.exp(-(f - t0) / 28);
  return (
    <div style={{ position: "absolute", left: x, top: y - 140 * (1 - d), opacity: Math.min(1, d * 1.6), transform: `translateX(-50%) rotate(${swing}deg)`, transformOrigin: "50% -160px" }}>
      <div style={{ position: "absolute", left: "50%", top: -160, width: 4, height: 160, background: C.inkSoft, marginLeft: -2 }} />
      <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: accent ? C.paper : C.ink, background: accent ? C.orange : C.white, border: `6px solid ${C.ink}`, borderRadius: 20, padding: "4px 34px 18px", boxShadow: `9px 9px 0 ${C.shadow}`, whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};

/** Big storage cabinet (= HDD). doors 0→1 opens. */
const Cabinet: React.FC<{ cx: number; bottom: number; s: number; draw: number; doors: number; glow?: number }> = ({ cx, bottom, s, draw, doors, glow = 0 }) => {
  const W = 300;
  const H = 440;
  return (
    <div style={{ position: "absolute", left: cx - W / 2, top: bottom - H, width: W, height: H, transform: `scale(${s})`, transformOrigin: "50% 100%" }}>
      <svg width={W + 20} height={H + 20} viewBox={`0 0 ${W + 20} ${H + 20}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={16} y={16} width={W} height={H} rx={18} fill={C.shadow} opacity={draw} />
        <rect x={0} y={0} width={W} height={H} rx={18} fill={C.white} stroke={glow > 0.5 ? C.orange : C.ink} strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} fillOpacity={ease(draw, 0.5, 1)} />
        {/* shelves full of boxes (visible when doors open) */}
        {[0, 1, 2].map((r) => (
          <g key={r} opacity={doors}>
            <path d={`M14 ${120 + r * 130} H${W - 14}`} stroke={C.ink} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={26 + k * 66} y={60 + r * 130} width={54} height={56} rx={6} fill={[C.olive, C.orange, C.blue, C.oliveSoft][(k + r) % 4]} stroke={C.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
      </svg>
      {/* doors */}
      <div style={{ position: "absolute", left: 6, top: 6, width: W / 2 - 6, height: H - 12, background: C.sand, border: `6px solid ${C.ink}`, borderRadius: 12, transformOrigin: "0 50%", transform: `perspective(900px) rotateY(${-doors * 105}deg)`, opacity: ease(draw, 0.6, 1) }}>
        <div style={{ position: "absolute", right: 18, top: "48%", width: 12, height: 44, borderRadius: 6, background: C.ink }} />
      </div>
      <div style={{ position: "absolute", right: 6, top: 6, width: W / 2 - 6, height: H - 12, background: C.sand, border: `6px solid ${C.ink}`, borderRadius: 12, transformOrigin: "100% 50%", transform: `perspective(900px) rotateY(${doors * 105}deg)`, opacity: ease(draw, 0.6, 1) }}>
        <div style={{ position: "absolute", left: 18, top: "48%", width: 12, height: 44, borderRadius: 6, background: C.ink }} />
      </div>
    </div>
  );
};

const Stamp: React.FC<{ text: string; x: number; y: number; t0: number; rot?: number; size?: number }> = ({ text, x, y, t0, rot = -8, size = 70 }) => {
  const f = useCurrentFrame();
  if (f < t0) return null;
  const d = ease(f, t0, t0 + 10, EASE_BACK);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.2, 1, d)})`, opacity: Math.min(1, d * 2), fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, color: C.paper, background: C.orange, border: `7px solid ${C.ink}`, borderRadius: 22, padding: "2px 30px 16px", boxShadow: `10px 10px 0 ${C.ink}`, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

/* ---------------- Scene 2: the desk is the RAM ---------------- */
export const RamDeskScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const DESK = cue("طاولة", 30);
  const OPEN = cue("فتحت", 74);
  const PUT = cue("بتحط", 110);
  const RAM = cue("الرام", 202);
  const draw = ease(f, DESK - 20, DESK + 14, EASE_IN_OUT);
  const app = ease(f, OPEN, OPEN + 12, EASE_BACK);
  const S = lerp(0.96, 1.06, ease(f, 0, durationInFrames, EASE_IN_OUT));
  const tools = [0, 1, 2];
  return (
    <Rig s={S} x={Math.sin(f / 50) * 12} y={0}>
      <Desk cx={500} top={620} w={760} draw={draw} />
      {/* program icon gets tapped */}
      <div style={{ position: "absolute", left: 440, top: 250, transform: `scale(${app * (1 - ease(f, PUT - 6, PUT + 4))})` }}>
        <div style={{ width: 120, height: 120, borderRadius: 28, background: C.olive, border: `6px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.shadow}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 0, height: 0, borderTop: "24px solid transparent", borderBottom: "24px solid transparent", borderLeft: `38px solid ${C.paper}` }} />
        </div>
        <div style={{ position: "absolute", left: 40, top: 40, width: 40, height: 40, borderRadius: 20, border: `5px solid ${C.orange}`, transform: `scale(${1 + ease(f, OPEN + 8, OPEN + 20) * 2})`, opacity: 1 - ease(f, OPEN + 8, OPEN + 20) }} />
      </div>
      {/* its tools drop onto the desk */}
      {tools.map((k, i) => {
        const t0 = PUT + i * 9;
        const d = ease(f, t0, t0 + 14, EASE_BACK);
        if (f < t0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 250 + i * 170, top: lerp(250, 528, d), transform: `rotate(${(1 - d) * (i % 2 ? 25 : -25)}deg)` }}>
            <Tool kind={k} />
          </div>
        );
      })}
      <Sign text="الرام" x={500} y={250} t0={RAM - 8} accent />
    </Rig>
  );
};

/* ---------------- Scene 3: small desk, many programs → things fall ---------------- */
export const RamOverflowScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const SMALL = cue("صغيرة", 28);
  const MANY = cue("كتيرة", 64);
  const FALL = cue("توقع", 116);
  const SLOW = cue("البطء", 179);
  const shrink = ease(f, SMALL, SMALL + 18, EASE_BACK);
  const w = lerp(760, 470, shrink);
  const S = lerp(1.0, 1.08, ease(f, 0, durationInFrames, EASE_IN_OUT));
  const fallen = f >= FALL;
  const jolt = fallen ? Math.exp(-(f - FALL) / 8) : 0;
  // 3 initial + 8 extra tools
  const items = Array.from({ length: 11 }).map((_, i) => {
    const row = i < 4 ? 0 : i < 8 ? 1 : 2;
    const col = i < 4 ? i : i < 8 ? i - 4 : i - 8;
    const perRow = row === 0 ? 4 : row === 1 ? 4 : 3;
    const span = w - 140;
    const x = 500 - span / 2 + (col * span) / (perRow - 1) - 60 + (row === 2 ? 40 : 0) + (rnd(i) - 0.5) * 30;
    const y = 528 - row * 80;
    const t0 = i < 3 ? -1 : MANY + (i - 3) * 5;
    const edge = i === 0 || i === 3 || i === 4 || i === 7 || i === 10;
    return { i, x, y, t0, edge };
  });
  return (
    <Rig s={S + jolt * 0.04} x={jolt * Math.sin(f * 2.3) * 12} y={0}>
      <Desk cx={500} top={620} w={w} draw={1} tint={ease(f, MANY + 20, MANY + 30)} />
      {items.map(({ i, x, y, t0, edge }) => {
        if (f < t0) return null;
        const d = t0 < 0 ? 1 : ease(f, t0, t0 + 12, EASE_BACK);
        const jit = ease(f, MANY + 30, FALL) * Math.sin(f * 2 + i) * 4;
        const ft = fallen && edge ? Math.max(0, (f - FALL - (i % 3) * 3) / 26) : 0;
        const side = x < 500 ? -1 : 1;
        return (
          <div key={i} style={{ position: "absolute", left: x + jit + side * ft * 260, top: lerp(160, y, d) + ft * ft * 700, transform: `rotate(${(1 - d) * 20 + side * ft * 140}deg)` }}>
            <Tool kind={i} hot={ease(f, MANY + 18, MANY + 28)} />
          </div>
        );
      })}
      <Sign text="الرام" x={500} y={250} t0={-30} accent />
      {/* speed gauge drops when things slow down */}
      {f > SLOW - 30 && (
        <div style={{ position: "absolute", left: 760, top: 110, transform: `scale(${ease(f, SLOW - 30, SLOW - 16, EASE_BACK)})` }}>
          <svg width={200} height={130} viewBox="0 0 200 130">
            <path d="M20 115 A80 80 0 0 1 180 115" fill={C.white} stroke={C.ink} strokeWidth={8} />
            <path d="M20 115 A80 80 0 0 1 60 46" fill="none" stroke={C.orange} strokeWidth={14} />
            <path d="M140 46 A80 80 0 0 1 180 115" fill="none" stroke={C.olive} strokeWidth={14} />
            <g transform={`rotate(${lerp(60, -70, ease(f, SLOW - 8, SLOW + 16, EASE_BACK))} 100 115)`}>
              <path d="M100 115 L100 50" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
            </g>
            <circle cx={100} cy={115} r={12} fill={C.ink} />
          </svg>
        </div>
      )}
    </Rig>
  );
};

/* ---------------- Scene 4: the HDD is the cabinet — big but far ---------------- */
export const HardCabinetScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const HDD = cue("الهارد", 38);
  const CAB = cue("الخزانة", 86);
  const BIG = cue("كبيرة", 115);
  const FAR = cue("بعيدة", 146);
  const pan = ease(f, HDD - 10, HDD + 20, EASE_IN_OUT);
  const zoomOut = ease(f, FAR - 6, FAR + 18, EASE_IN_OUT);
  const S = lerp(1.05, 0.86, pan * 0.5 + zoomOut * 0.5);
  const camX = lerp(-120, 40, pan) - zoomOut * 40;
  const draw = ease(f, HDD, HDD + 26, EASE_IN_OUT);
  const doors = ease(f, CAB, CAB + 18, EASE_BACK);
  const big = 1 + 0.18 * ease(f, BIG, BIG + 14, EASE_BACK);
  const dist = ease(f, FAR, FAR + 18, EASE_IN_OUT);
  return (
    <Rig s={S} x={camX} y={0}>
      <Desk cx={250} top={620} w={420} draw={1} />
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: 120 + i * 140, top: 528 }}>
          <Tool kind={i} />
        </div>
      ))}
      <Sign text="الرام" x={250} y={260} t0={-30} />
      <Cabinet cx={860} bottom={850} s={big * 0.95} draw={draw} doors={doors} />
      <Sign text="الهارد" x={860} y={250} t0={HDD + 10} accent />
      {/* distance arrow */}
      <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M480 700 H690" stroke={C.orange} strokeWidth={8} strokeDasharray="18 16" strokeLinecap="round" opacity={dist} strokeDashoffset={-f * 2} />
        <path d="M480 700 l22 -16 M480 700 l22 16 M690 700 l-22 -16 M690 700 l-22 16" stroke={C.orange} strokeWidth={8} strokeLinecap="round" opacity={dist} />
      </svg>
      <Stamp text="بعيدة" x={585} y={760} t0={FAR + 4} size={54} rot={-5} />
    </Rig>
  );
};

/* ---------------- Scene 5: swapping desk ↔ cabinet, thousands of times slower ---------------- */
export const SwapScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const FULL = cue("تتعب", 31);
  const PUT = cue("بيحط", 70);
  const BACK = cue("وبيرجع", 116);
  const SLOW = cue("أبطأ", 188);
  const full = ease(f, FULL, FULL + 12);
  const slowmo = f > SLOW ? 0.25 : 1;
  const S = 0.9;
  // a card travels along the arc desk → cabinet, then back
  const travel = (start: number, dur: number, dir: 1 | -1, k: number) => {
    const tt = ease(f, start, start + dur / slowmo, EASE_IN_OUT);
    const t = dir === 1 ? tt : 1 - tt;
    const ax = 300, ay = 500, bx = 820, by = 470;
    const mx = 560, my = 230;
    const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx;
    const y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by;
    const vis = f >= start && f <= start + dur / slowmo + 2;
    return vis ? (
      <div key={`${start}-${k}`} style={{ position: "absolute", left: x - 60, top: y - 43, transform: `rotate(${Math.sin(t * Math.PI) * 18 * dir}deg) scale(${1 - 0.25 * Math.sin(t * Math.PI)})` }}>
        <Tool kind={k} hot={1} />
      </div>
    ) : null;
  };
  return (
    <Rig s={S} x={0} y={0}>
      <Desk cx={300} top={620} w={440} draw={1} tint={full} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 140 + (i % 2) * 150 + (i > 1 ? 70 : 0), top: 528 - (i > 1 ? 80 : 0) + (full > 0 ? Math.sin(f * 2 + i) * 3 : 0) }}>
          <Tool kind={i} hot={full} />
        </div>
      ))}
      <Cabinet cx={830} bottom={860} s={0.95} draw={1} doors={1} glow={ease(f, PUT, PUT + 6)} />
      <Sign text="الرام" x={300} y={260} t0={-30} />
      <Sign text="الهارد" x={830} y={250} t0={-30} accent />
      {/* dashed route */}
      <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M300 500 Q560 230 820 470" stroke={C.inkSoft} strokeWidth={6} strokeDasharray="14 14" fill="none" opacity={ease(f, PUT - 10, PUT)} strokeDashoffset={(f > BACK ? f : -f) * 1.5} />
      </svg>
      {[0, 1, 2].map((k) => travel(PUT + k * 14, 26, 1, k))}
      {[0, 1].map((k) => travel(BACK + k * 16, 26, -1, k + 2))}
      {/* loop arrows between them */}
      <div style={{ position: "absolute", left: 505, top: 300, opacity: ease(f, BACK, BACK + 10), transform: `rotate(${f * (f > SLOW ? 1.5 : 6)}deg)` }}>
        <svg width={110} height={110} viewBox="0 0 110 110">
          <path d="M55 12 A43 43 0 1 1 15 70" stroke={C.olive} strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d="M55 12 l-4 22 M55 12 l20 10" stroke={C.olive} strokeWidth={11} strokeLinecap="round" />
        </svg>
      </div>
      <Stamp text="أبطأ × ١٠٠٠" x={560} y={140} t0={SLOW} size={66} />
    </Rig>
  );
};

/* ---------------- Scene 6: the fix — close tabs, Task Manager, add RAM ---------------- */
export const FixScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const CLOSE = cue("سكّر", 33);
  const TM = cue("التاسك", 105);
  const EATS = cue("ياكل", 155);
  const ADD = cue("تزيد", 257);
  const IF = cue("وإذا", 183);
  const step = f < TM - 6 ? 0 : f < IF ? 1 : 2;
  const swap = (a: number) => ease(f, a - 8, a + 8, EASE_IN_OUT);
  const tabsLeft = 8 - Math.floor(ease(f, CLOSE + 6, TM - 14) * 6);
  const ram = step === 0 ? lerp(92, 48, ease(f, CLOSE + 6, TM - 14)) : step === 1 ? 48 : lerp(48, 24, ease(f, ADD + 6, ADD + 20));
  const panelOut = (a: number) => 1 - ease(f, a - 8, a + 2, EASE_IN_OUT);
  return (
    <Rig s={1} x={0} y={0}>
      {/* step badges */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", justifyContent: "center", gap: 26, direction: "rtl" }}>
        {["١", "٢", "٣"].map((n, i) => (
          <div key={i} style={{ width: 84, height: 84, borderRadius: 42, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 48, paddingBottom: 10, border: `6px solid ${C.ink}`, background: i < step ? C.olive : i === step ? C.orange : C.white, color: i <= step ? C.paper : C.ink, transform: `scale(${i === step ? 1.15 : 1})`, boxShadow: `6px 6px 0 ${C.shadow}` }}>
            {i < step ? "✓" : n}
          </div>
        ))}
      </div>

      {/* 1 — browser with too many tabs */}
      {step === 0 && (
        <div style={{ position: "absolute", left: 110, top: 220, width: 780, height: 520, background: C.white, border: `7px solid ${C.ink}`, borderRadius: 26, boxShadow: `14px 14px 0 ${C.olive}`, overflow: "hidden", transform: `scale(${ease(f, 0, 14, EASE_BACK)}) translateY(${(1 - panelOut(TM)) * 0}px)`, opacity: panelOut(TM) }}>
          <div style={{ display: "flex", gap: 8, padding: "16px 16px 0", background: C.sand, borderBottom: `6px solid ${C.ink}`, direction: "ltr" }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const closing = i >= tabsLeft;
              return (
                <div key={i} style={{ flex: closing ? 0 : 1, minWidth: 0, height: 54, borderRadius: "14px 14px 0 0", background: i === 0 ? C.white : C.grid, border: closing ? "none" : `4px solid ${C.ink}`, borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: closing ? 0 : 10, overflow: "hidden" }}>
                  {!closing && <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 26, color: C.orange }}>×</div>}
                </div>
              );
            })}
          </div>
          <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 18 }}>
            {[0.9, 0.7, 0.8, 0.5].map((w, i) => <div key={i} style={{ height: 22, width: `${w * 100}%`, borderRadius: 11, background: i === 0 ? C.olive : C.grid }} />)}
          </div>
        </div>
      )}

      {/* 2 — task manager, the RAM eater lights up */}
      {step === 1 && (
        <div style={{ position: "absolute", left: 110, top: 220, width: 780, height: 520, background: C.white, border: `7px solid ${C.ink}`, borderRadius: 26, boxShadow: `14px 14px 0 ${C.orange}`, transform: `scale(${swap(TM)}) rotate(${(1 - swap(TM)) * -6}deg)`, opacity: panelOut(IF), direction: "ltr" }}>
          <div style={{ padding: "18px 26px", borderBottom: `6px solid ${C.ink}`, background: C.sand, fontFamily: FONT_UI, fontWeight: 600, fontSize: 36, color: C.ink }}>Task Manager</div>
          {[0.86, 0.32, 0.22, 0.12, 0.08].map((v, i) => {
            const hit = i === 0 && f > EATS;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 26px", background: hit ? `rgba(255,212,59,${0.25 + 0.15 * Math.sin(f / 3)})` : "transparent" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: [C.orange, C.olive, C.blue, C.olive, C.blue][i], border: `4px solid ${C.ink}` }} />
                <div style={{ flex: 1, height: 26, borderRadius: 13, background: C.grid, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${v * 100 * ease(f, TM + i * 3, TM + 20 + i * 3)}%`, background: hit ? C.orange : C.olive }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3 — plug in more RAM */}
      {step === 2 && (
        <div style={{ position: "absolute", left: 110, top: 220, width: 780, height: 520, transform: `scale(${swap(IF)})` }}>
          <svg width={780} height={520} viewBox="0 0 780 520" style={{ overflow: "visible" }}>
            <rect x={40} y={260} width={700} height={230} rx={22} fill={C.oliveSoft} stroke={C.ink} strokeWidth={8} />
            {[0, 1].map((k) => <rect key={k} x={120} y={300 + k * 90} width={540} height={34} rx={8} fill={C.sand} stroke={C.ink} strokeWidth={6} />)}
            {Array.from({ length: 10 }).map((_, k) => <path key={k} d={`M${70 + k * 70} 470 v-30 h30`} stroke={C.olive} strokeWidth={5} fill="none" />)}
            {/* existing stick */}
            <rect x={150} y={230} width={480} height={80} rx={8} fill={C.olive} stroke={C.ink} strokeWidth={6} />
            {/* new stick dropping in */}
            <g transform={`translate(0 ${lerp(-420, 0, ease(f, ADD - 10, ADD + 6, EASE_BACK))})`}>
              <rect x={150} y={320} width={480} height={80} rx={8} fill={C.orange} stroke={C.ink} strokeWidth={6} />
              {Array.from({ length: 6 }).map((_, k) => <rect key={k} x={180 + k * 74} y={336} width={50} height={36} rx={4} fill={C.ink} />)}
            </g>
          </svg>
          {f > ADD + 6 && <div style={{ position: "absolute", left: 390, top: 360, width: 40, height: 40, borderRadius: 20, border: `6px solid ${C.orange}`, transform: `translate(-50%,-50%) scale(${1 + ease(f, ADD + 6, ADD + 20) * 8})`, opacity: 1 - ease(f, ADD + 6, ADD + 20) }} />}
        </div>
      )}

      {/* RAM usage meter, always visible */}
      <div style={{ position: "absolute", left: 160, top: 800, width: 680, direction: "rtl" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_UI, fontWeight: 600, fontSize: 36, color: C.ink, marginBottom: 10 }}>
          <span>استهلاك الرام</span>
          <span style={{ direction: "ltr", color: ram > 70 ? C.orange : C.olive }}>{Math.round(ram)}%</span>
        </div>
        <div style={{ height: 38, borderRadius: 19, background: C.grid, border: `5px solid ${C.ink}`, overflow: "hidden", direction: "ltr" }}>
          <div style={{ height: "100%", width: `${ram}%`, background: ram > 70 ? C.orange : C.olive }} />
        </div>
      </div>
    </Rig>
  );
};
