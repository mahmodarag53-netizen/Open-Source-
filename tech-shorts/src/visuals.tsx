import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Icon } from "./icons";
import { C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_TITLE, FONT_UI } from "./theme";

export type Visual = {
  type: "hero" | "desk" | "compare" | "flow" | "bars" | "steps" | "bigtext";
  icon?: string;
  state?: string;
  label?: string;
  fill?: number;
  overflow?: boolean;
  left?: { icon: string; label: string };
  right?: { icon: string; label: string };
  winner?: "left" | "right";
  from?: string;
  to?: string;
  fromLabel?: string;
  toLabel?: string;
  obstacle?: string;
  tunnel?: boolean;
  items?: (string | { label: string; value: number })[];
  unit?: string;
  text?: string;
  sub?: string;
};

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

const Chip: React.FC<{ text: string; color?: string; size?: number; o?: number }> = ({ text, color = C.ink, size = 46, o = 1 }) => (
  <div
    style={{
      fontFamily: FONT_UI, fontWeight: 600, fontSize: size, color: C.paper, background: color,
      padding: "10px 34px 14px", borderRadius: 999, opacity: o, transform: `translateY(${(1 - o) * 30}px)`,
      whiteSpace: "nowrap", direction: "rtl",
    }}
  >
    {text}
  </div>
);

const Hero: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const d = ease(f, 0, 30, EASE_IN_OUT);
  const pop = interpolate(ease(f, 0, 22, EASE_BACK), [0, 1], [0.6, 1]);
  const float = Math.sin(f / 22) * 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div style={{ transform: `translateY(${float}px) scale(${pop})` }}>
        <Icon name={v.icon!} size={780} d={d} f={f} state={v.state} />
      </div>
      {v.label && <Chip text={v.label} o={ease(f, 18, 34)} />}
    </div>
  );
};


const Desk: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const TOOL_COLORS = [C.orange, C.blue, C.olive, C.ink, C.orangeSoft, C.blueSoft, C.oliveSoft, C.sand];
  const d = ease(f, 0, 24, EASE_IN_OUT);
  const n = Math.round(4 + (v.fill ?? 0.5) * 10);
  const shake = v.overflow ? Math.sin(f * 1.7) * 4 * ease(f, 40, 55) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <svg width={860} height={600} viewBox="0 40 400 280" style={{ overflow: "visible", transform: `translateX(${shake}px)` }}>
        <g transform="translate(0 -40)">
          <Icon name="desk" size={400} d={d} f={f} />
        </g>
        {Array.from({ length: n }).map((_, i) => {
          const start = 14 + i * 4;
          const drop = ease(f, start, start + 14, EASE_BACK);
          const slot = i % 7;
          const row = Math.floor(i / 7);
          const x = 60 + slot * 42;
          const fallOff = v.overflow && i >= 10 ? ease(f, 50 + (i - 10) * 5, 80 + (i - 10) * 5, EASE_IN_OUT) : 0;
          const side = i % 2 ? 1 : -1;
          const y = 160 - row * 34 - (1 - drop) * 260 + fallOff * 220;
          const shape = i % 3;
          const col = TOOL_COLORS[i % TOOL_COLORS.length];
          return (
            <g key={i} transform={`translate(${x + fallOff * side * 140} ${y}) rotate(${fallOff * side * 120 + (i % 2 ? 4 : -4)} 16 16)`} opacity={drop}>
              {shape === 0 && <rect width={34} height={30} rx={4} fill={col} stroke={C.ink} strokeWidth={3.5} />}
              {shape === 1 && <circle cx={16} cy={15} r={16} fill={col} stroke={C.ink} strokeWidth={3.5} />}
              {shape === 2 && <path d="M0 30 L17 0 L34 30 Z" fill={col} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />}
            </g>
          );
        })}
      </svg>
      {v.label && <Chip text={v.label} color={v.overflow ? C.orange : C.ink} o={ease(f, 10, 26)} />}
    </div>
  );
};

const Compare: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  // RTL: "left" item in data is read first → placed on the right side.
  const items = [v.left!, v.right!];
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "row-reverse", gap: 20, alignItems: "flex-end" }}>
      {items.map((it, i) => {
        const start = i * 10;
        const d = ease(f, start, start + 26, EASE_IN_OUT);
        const isWin = v.winner === (i === 0 ? "left" : "right");
        const isLose = v.winner && !isWin;
        const judge = v.winner ? ease(f, 45, 62, EASE_BACK) : 0;
        const s = 1 + (isWin ? 0.08 : isLose ? -0.1 : 0) * judge;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, transform: `scale(${s})`, opacity: isLose ? 1 - 0.45 * judge : 1 }}>
            <div style={{ transform: `translateY(${Math.sin((f + i * 20) / 20) * 8}px)` }}>
              <Icon name={it.icon} size={470} d={d} f={f} />
            </div>
            <Chip text={it.label} color={isWin && judge > 0.5 ? C.olive : C.ink} size={it.label.length > 14 ? 30 : 42} o={ease(f, start + 14, start + 30)} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute", left: "50%", top: "40%", transform: `translate(-50%,-50%) scale(${ease(f, 18, 32, EASE_BACK)})`,
          fontFamily: FONT_TITLE, fontSize: 70, color: C.orange,
        }}
      >
        {v.winner ? "" : "×"}
      </div>
    </div>
  );
};

const Flow: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const dA = ease(f, 0, 24, EASE_IN_OUT);
  const dB = ease(f, 8, 32, EASE_IN_OUT);
  const path = ease(f, 18, 40, EASE_IN_OUT);
  const blocked = !!v.obstacle;
  const W = 980;
  return (
    <div style={{ position: "relative", width: W, height: 720 }}>
      <svg width={W} height={720} viewBox={`0 0 ${W} 720`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {v.tunnel && (
          <path d="M680 300 C560 180 340 180 220 300" stroke={C.oliveSoft} strokeWidth={90} fill="none" strokeLinecap="round" opacity={0.7 * path} />
        )}
        <path d="M680 300 C560 180 340 180 220 300" stroke={C.ink} strokeWidth={6} fill="none" strokeDasharray="4 22" strokeLinecap="round" pathLength={1} opacity={path} />
        {path > 0.95 &&
          Array.from({ length: 5 }).map((_, i) => {
            const t = ((f - 40) / 45 + i / 5) % 1;
            const x = (1 - t) ** 3 * 680 + 3 * (1 - t) ** 2 * t * 560 + 3 * (1 - t) * t * t * 340 + t ** 3 * 220;
            const y = (1 - t) ** 3 * 300 + 3 * (1 - t) ** 2 * t * 180 + 3 * (1 - t) * t * t * 180 + t ** 3 * 300;
            const fade = blocked ? Math.max(0, 1 - Math.max(0, t - 0.45) * 2.4) : 1;
            return <rect key={i} x={x - 18} y={y - 13} width={36} height={26} rx={5} fill={i % 2 ? C.orange : C.blue} stroke={C.ink} strokeWidth={4} opacity={fade * Math.min(1, t * 6)} transform={`rotate(${-20 + t * 40} ${x} ${y})`} />;
          })}
      </svg>
      <div style={{ position: "absolute", right: 0, top: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Icon name={v.from!} size={360} d={dA} f={f} />
        {v.fromLabel && <Chip text={v.fromLabel} size={38} o={ease(f, 12, 26)} />}
      </div>
      <div style={{ position: "absolute", left: 0, top: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Icon name={v.to!} size={360} d={dB} f={f} />
        {v.toLabel && <Chip text={v.toLabel} size={38} color={C.orange} o={ease(f, 20, 34)} />}
      </div>
      {blocked && (
        <div style={{ position: "absolute", left: W / 2 - 110, top: 40, transform: `translateY(${(1 - ease(f, 26, 44, EASE_BACK)) * -400}px)` }}>
          <Icon name={v.obstacle!} size={220} d={ease(f, 26, 46)} f={f} />
        </div>
      )}
    </div>
  );
};

const Bars: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const items = v.items as { label: string; value: number }[];
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div style={{ width: 880, display: "flex", flexDirection: "column", gap: 46, direction: "rtl" }}>
      {items.map((it, i) => {
        const g = ease(f, 8 + i * 10, 40 + i * 10, EASE_IN_OUT);
        const w = Math.max(0.06, it.value / max) * 600 * g;
        const shown = it.value * g;
        const dec = it.value % 1 !== 0 ? 1 : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, opacity: ease(f, i * 10, 14 + i * 10) }}>
            <div style={{ width: 210, fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: C.ink, textAlign: "right" }}>{it.label}</div>
            <div style={{ height: 96, width: w, background: i === items.length - 1 ? C.orange : C.blue, border: `6px solid ${C.ink}`, borderRadius: 14 }} />
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 50, color: C.ink, direction: "ltr" }}>{shown.toFixed(dec)}</div>
          </div>
        );
      })}
      {v.unit && (
        <div style={{ fontFamily: FONT_UI, fontSize: 36, color: C.inkSoft, textAlign: "center", opacity: ease(f, 30, 46) }}>{v.unit}</div>
      )}
    </div>
  );
};

const Steps: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const items = v.items as string[];
  return (
    <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 34, direction: "rtl" }}>
      {items.map((t, i) => {
        const s = 6 + i * 16;
        const o = ease(f, s, s + 20, EASE_OUT);
        const chk = ease(f, s + 14, s + 30, EASE_IN_OUT);
        return (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 30, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 26,
              padding: "26px 34px", opacity: o, transform: `translateX(${(1 - o) * -160}px) rotate(${(1 - o) * -3}deg)`,
              boxShadow: `10px 10px 0 ${i === items.length - 1 ? C.orange : C.oliveSoft}`,
            }}
          >
            <svg width={84} height={84} viewBox="0 0 84 84">
              <circle cx={42} cy={42} r={36} fill={chk > 0.5 ? C.olive : C.sand} stroke={C.ink} strokeWidth={5} />
              <path d="M24 44 L37 57 L61 30" stroke={C.white} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - chk} />
            </svg>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 54, color: C.ink }}>{t}</div>
          </div>
        );
      })}
    </div>
  );
};

const BigText: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const o = ease(f, 0, 22, EASE_BACK);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      <div
        style={{
          fontFamily: FONT_TITLE, fontSize: (v.text?.length ?? 0) > 10 ? 120 : 170, color: C.ink, direction: "rtl",
          transform: `scale(${interpolate(o, [0, 1], [0.5, 1])}) rotate(${(1 - o) * -6}deg)`, opacity: Math.min(1, o * 1.5),
          background: C.white, border: `8px solid ${C.ink}`, borderRadius: 30, padding: "20px 60px 40px", boxShadow: `16px 16px 0 ${C.orange}`,
          whiteSpace: "nowrap",
        }}
      >
        {v.text}
      </div>
      {v.sub && <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 52, color: C.orange, opacity: ease(f, 16, 32), direction: "rtl" }}>{v.sub}</div>}
    </div>
  );
};

export const VisualView: React.FC<{ v: Visual }> = ({ v }) => {
  switch (v.type) {
    case "hero": return <Hero v={v} />;
    case "desk": return <Desk v={v} />;
    case "compare": return <Compare v={v} />;
    case "flow": return <Flow v={v} />;
    case "bars": return <Bars v={v} />;
    case "steps": return <Steps v={v} />;
    case "bigtext": return <BigText v={v} />;
  }
};
