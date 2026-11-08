import React from "react";
import { useCurrentFrame } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, FONT_TITLE, FONT_UI } from "../theme";
import { ease, lerp } from "./Ep01Flat";

/* Shared animated parts for the flat (style C) scenes. All sizes in stage px (1000×1000). */

export const Abs: React.FC<{ x: number; y: number; s?: number; r?: number; o?: number; children: React.ReactNode; origin?: string }> = ({ x, y, s = 1, r = 0, o = 1, children, origin = "50% 50%" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${r}deg) scale(${s})`, transformOrigin: origin, opacity: o }}>{children}</div>
);

/** Pop-in (pure, safe inside conditionals): scale with overshoot from frame t0. */
export const pop = (f: number, t0: number, dur = 14) => ease(f, t0, t0 + dur, EASE_BACK);

/** Pop-in helper: scale with overshoot from frame t0. */
export const usePop = (t0: number, dur = 14) => {
  const f = useCurrentFrame();
  return ease(f, t0, t0 + dur, EASE_BACK);
};

export const Chip: React.FC<{ text: string; accent?: boolean; size?: number }> = ({ text, accent, size = 44 }) => (
  <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: size, color: accent ? C.paper : C.ink, background: accent ? C.orange : C.white, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "4px 28px 10px", boxShadow: `7px 7px 0 ${C.shadow}`, whiteSpace: "nowrap", direction: "rtl" }}>
    {text}
  </div>
);

/** Monitor / PC. screen content as children. */
export const Monitor: React.FC<{ w?: number; draw?: number; screen?: string; children?: React.ReactNode }> = ({ w = 520, draw = 1, screen = C.oliveSoft, children }) => {
  const h = w * 0.64;
  return (
    <div style={{ position: "relative", width: w, height: h + 110 }}>
      <svg width={w + 20} height={h + 120} viewBox={`0 0 ${w + 20} ${h + 120}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={w / 2 - 28} y={h} width={56} height={80} fill={C.sand} stroke={C.ink} strokeWidth={8} opacity={draw} />
        <rect x={w / 2 - 110} y={h + 76} width={220} height={24} rx={12} fill={C.white} stroke={C.ink} strokeWidth={8} opacity={draw} />
        <rect x={16} y={16} width={w} height={h} rx={24} fill={C.shadow} opacity={draw} />
        <rect x={0} y={0} width={w} height={h} rx={24} fill={C.white} stroke={C.ink} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <rect x={24} y={24} width={w - 48} height={h - 48} rx={10} fill={screen} opacity={ease(draw, 0.6, 1)} />
      </svg>
      <div style={{ position: "absolute", left: 24, top: 24, width: w - 48, height: h - 48, overflow: "hidden", borderRadius: 10 }}>{children}</div>
    </div>
  );
};

export const Laptop: React.FC<{ w?: number; screen?: string; children?: React.ReactNode }> = ({ w = 460, screen = C.oliveSoft, children }) => {
  const h = w * 0.62;
  return (
    <div style={{ position: "relative", width: w + 80, height: h + 60 }}>
      <svg width={w + 80} height={h + 60} viewBox={`0 0 ${w + 80} ${h + 60}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={56} y={14} width={w} height={h} rx={20} fill={C.shadow} />
        <rect x={40} y={0} width={w} height={h} rx={20} fill={C.white} stroke={C.ink} strokeWidth={9} />
        <rect x={60} y={20} width={w - 40} height={h - 40} rx={8} fill={screen} />
        <path d={`M0 ${h + 6} H${w + 80} L${w + 50} ${h + 44} H30 Z`} fill={C.sand} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 20, width: w - 40, height: h - 40, overflow: "hidden", borderRadius: 8 }}>{children}</div>
    </div>
  );
};

export const Phone: React.FC<{ bars?: number; children?: React.ReactNode; s?: number }> = ({ bars = 4, children, s = 1 }) => (
  <div style={{ position: "relative", width: 150 * s, height: 270 * s, borderRadius: 30 * s, background: C.white, border: `${8 * s}px solid ${C.ink}`, boxShadow: `${8 * s}px ${8 * s}px 0 ${C.shadow}` }}>
    <div style={{ position: "absolute", inset: 12 * s, borderRadius: 14 * s, background: C.oliveSoft, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 10 * s, top: 10 * s, display: "flex", alignItems: "flex-end", gap: 4 * s }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ width: 9 * s, height: (10 + k * 8) * s, borderRadius: 3, background: k < Math.round(bars) ? C.orange : "rgba(241,238,229,0.25)" }} />
        ))}
      </div>
      {children}
    </div>
  </div>
);

export const Router: React.FC<{ s?: number }> = ({ s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={220 * s} height={160 * s} viewBox="0 0 220 160" style={{ overflow: "visible" }}>
      <path d="M50 80 L36 10 M170 80 L184 10" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <rect x={20} y={80} width={180} height={60} rx={16} fill={C.white} stroke={C.ink} strokeWidth={9} />
      {[0, 1, 2, 3].map((k) => <circle key={k} cx={56 + k * 34} cy={110} r={8} fill={(Math.floor(f / 5) + k) % 3 ? C.olive : C.orange} />)}
    </svg>
  );
};

/** Expanding wifi rings from a point; `power` fades them, `blockAt` x position where they get absorbed. */
export const Waves: React.FC<{ cx: number; cy: number; max?: number; power?: number; color?: string; speed?: number }> = ({ cx, cy, max = 420, power = 1, color = C.olive, speed = 3 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((k) => {
        const r = 30 + ((f * speed + k * (max / 4)) % max);
        return <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8} opacity={(1 - r / max) * power} />;
      })}
    </svg>
  );
};

export const Cursor: React.FC<{ press?: number }> = ({ press = 0 }) => (
  <svg width={70} height={90} viewBox="0 0 70 90" style={{ transform: `scale(${1 - 0.18 * press})`, overflow: "visible" }}>
    <path d="M6 4 L6 70 L24 54 L36 84 L48 78 L36 50 L60 50 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

export const Ripple: React.FC<{ t0: number; color?: string }> = ({ t0, color = C.orange }) => {
  const f = useCurrentFrame();
  if (f < t0) return null;
  const t = ease(f, t0, t0 + 14);
  return <div style={{ width: 40, height: 40, borderRadius: 20, border: `6px solid ${color}`, transform: `translate(-50%,-50%) scale(${1 + t * 4})`, opacity: 1 - t, position: "absolute" }} />;
};

/** Cute flat virus character. */
export const Virus: React.FC<{ s?: number; walk?: number }> = ({ s = 1, walk = 0 }) => {
  const f = useCurrentFrame();
  const bob = Math.abs(Math.sin(f / 4)) * 8 * walk;
  return (
    <svg width={150 * s} height={150 * s} viewBox="0 0 150 150" style={{ overflow: "visible", transform: `translateY(${-bob}px) rotate(${Math.sin(f / 4) * 6 * walk}deg)` }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + f / 30;
        return <g key={i}><path d={`M${75 + Math.cos(a) * 40} ${75 + Math.sin(a) * 40} L${75 + Math.cos(a) * 64} ${75 + Math.sin(a) * 64}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" /><circle cx={75 + Math.cos(a) * 66} cy={75 + Math.sin(a) * 66} r={9} fill={C.orange} stroke={C.ink} strokeWidth={5} /></g>;
      })}
      <circle cx={75} cy={75} r={46} fill={C.orange} stroke={C.ink} strokeWidth={8} />
      <circle cx={60} cy={68} r={9} fill={C.ink} /><circle cx={90} cy={68} r={9} fill={C.ink} />
      <circle cx={63} cy={65} r={3} fill={C.white} /><circle cx={93} cy={65} r={3} fill={C.white} />
      <path d="M58 92 Q75 104 92 92" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** Stopwatch with sweeping hand; `t` 0..1 hand position. */
export const Stopwatch: React.FC<{ t: number; label?: string; s?: number }> = ({ t, label, s = 1 }) => (
  <div style={{ position: "relative", width: 200 * s, height: 230 * s }}>
    <svg width={200 * s} height={230 * s} viewBox="0 0 200 230">
      <rect x={85} y={4} width={30} height={22} rx={6} fill={C.ink} />
      <circle cx={100} cy={128} r={90} fill={C.white} stroke={C.ink} strokeWidth={10} />
      <path d={`M100 128 L${100 + Math.sin(t * Math.PI * 2) * 70} ${128 - Math.cos(t * Math.PI * 2) * 70}`} stroke={C.orange} strokeWidth={10} strokeLinecap="round" />
      <circle cx={100} cy={128} r={10} fill={C.ink} />
    </svg>
    {label && <div style={{ position: "absolute", left: "50%", top: 236 * s, transform: "translateX(-50%)" }}><Chip text={label} accent size={40 * s} /></div>}
  </div>
);

/** Horizontal progress bar. */
export const Progress: React.FC<{ v: number; w?: number; color?: string }> = ({ v, w = 420, color = C.olive }) => (
  <div style={{ width: w, height: 34, borderRadius: 17, background: C.grid, border: `5px solid ${C.ink}`, overflow: "hidden", direction: "ltr" }}>
    <div style={{ height: "100%", width: `${Math.max(0, Math.min(1, v)) * 100}%`, background: color }} />
  </div>
);

/** Speed gauge, v 0..1. */
export const Gauge: React.FC<{ v: number; s?: number; label?: string }> = ({ v, s = 1, label }) => (
  <div style={{ position: "relative", width: 260 * s, height: 170 * s }}>
    <svg width={260 * s} height={170 * s} viewBox="0 0 260 170">
      <path d="M25 150 A105 105 0 0 1 235 150" fill={C.white} stroke={C.ink} strokeWidth={10} />
      <path d="M25 150 A105 105 0 0 1 80 60" fill="none" stroke={C.orange} strokeWidth={16} />
      <path d="M180 60 A105 105 0 0 1 235 150" fill="none" stroke={C.olive} strokeWidth={16} />
      <g transform={`rotate(${lerp(-80, 80, v)} 130 150)`}><path d="M130 150 L130 66" stroke={C.ink} strokeWidth={11} strokeLinecap="round" /></g>
      <circle cx={130} cy={150} r={15} fill={C.ink} />
    </svg>
    {label && <div style={{ position: "absolute", left: "50%", top: 178 * s, transform: "translateX(-50%)", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40 * s, color: C.ink, whiteSpace: "nowrap", direction: "ltr" }}>{label}</div>}
  </div>
);

/** Big number/word that pops. */
export const BigWord: React.FC<{ text: string; size?: number; accent?: boolean; ltr?: boolean }> = ({ text, size = 120, accent, ltr }) => (
  <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: accent ? C.orange : C.ink, textShadow: `6px 6px 0 ${C.shadow}`, whiteSpace: "nowrap", direction: ltr ? "ltr" : "rtl" }}>{text}</div>
);

/** Cross-out line drawn over a box of width w. */
export const Strike: React.FC<{ t: number; w: number }> = ({ t, w }) => (
  <svg width={w} height={60} viewBox={`0 0 ${w} 60`} style={{ position: "absolute", left: 0, top: "50%", marginTop: -30, overflow: "visible" }}>
    <path d={`M0 40 L${w} 20`} stroke={C.orange} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
  </svg>
);

export { EASE_BACK, EASE_IN_OUT };
