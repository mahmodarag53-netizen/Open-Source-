import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon } from "./icons";
import { LagScene } from "./scenes/LagScene";
import type { Word } from "./Episode";
import { C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_HEAVY, FONT_UI } from "./theme";

export type Visual = {
  type: "hero" | "desk" | "compare" | "flow" | "bars" | "steps" | "bigtext" | "asset" | "custom";
  scene?: string;
  asset?: string;
  focus?: [number, number];
  zoom?: [number, number];
  tags?: { text: string; x: number; y: number; accent?: boolean }[];
  packets?: { from: [number, number]; to: [number, number]; lift?: number };
  shake?: boolean;
  width?: number;
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

const glass = (accent: string, strong = false): React.CSSProperties => ({
  background: "linear-gradient(160deg, rgba(34,58,92,0.72), rgba(10,20,36,0.88))",
  border: `2px solid ${accent}`,
  boxShadow: `0 0 ${strong ? 40 : 22}px ${accent === C.orange ? C.glow2 : C.glow}, inset 0 0 26px rgba(63,211,240,0.10)`,
});

/** Isometric glowing pedestal — real CSS 3D plane under hero objects. */
const Platform: React.FC<{ w: number; f: number; o: number }> = ({ w, f, o }) => (
  <div style={{ position: "absolute", left: "50%", bottom: -w * 0.08, width: w, height: w, marginLeft: -w / 2, transform: `rotateX(64deg) rotateZ(45deg) scale(${0.8 + 0.2 * o})`, opacity: o, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "linear-gradient(135deg, #16294A, #0B1628)", border: `3px solid ${C.olive}`, boxShadow: `0 0 50px ${C.glow}, inset 0 0 40px rgba(63,211,240,0.25)` }} />
    <div style={{ position: "absolute", inset: w * 0.12, borderRadius: 30, border: `3px solid ${C.orange}`, opacity: 0.55 + 0.45 * Math.sin(f / 9), boxShadow: `0 0 26px ${C.glow2}` }} />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${20 + i * 20}%`, height: 2, background: C.olive, opacity: 0.25 }} />
    ))}
  </div>
);

const Chip: React.FC<{ text: string; color?: string; size?: number; o?: number }> = ({ text, color = C.ink, size = 46, o = 1 }) => (
  <div
    style={{
      fontFamily: FONT_UI, fontWeight: 600, fontSize: size, color: color === C.ink ? C.ink : color, ...glass(color === C.ink ? C.olive : color),
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
      <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
        <Platform w={560} f={f} o={ease(f, 0, 26, EASE_OUT)} />
        <div style={{ transform: `translateY(${float - 40}px) scale(${pop})` }}>
          <Icon name={v.icon!} size={720} d={d} f={f} state={v.state} />
        </div>
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
          fontFamily: FONT_HEAVY, fontSize: 70, color: C.orange,
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
            <div style={{ height: 96, width: w, background: `linear-gradient(90deg, ${i === items.length - 1 ? C.orange : C.olive}, ${i === items.length - 1 ? "#9AA62C" : "#1E7E94"})`, borderRadius: 16, boxShadow: `0 0 26px ${i === items.length - 1 ? C.glow2 : C.glow}`, border: "2px solid rgba(255,255,255,0.35)" }} />
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
              position: "relative", display: "flex", alignItems: "center", gap: 30, ...glass(chk > 0.5 ? C.olive : "rgba(125,144,170,0.6)"), borderRadius: 28,
              padding: "44px 34px 30px", opacity: o, transform: `perspective(1200px) rotateY(${(1 - o) * -35}deg) translateX(${(1 - o) * -160}px)`,
            }}
          >
            <div style={{ position: "absolute", top: 14, left: 26, display: "flex", gap: 10 }}>
              {[0, 1, 2].map((k) => <div key={k} style={{ width: 12, height: 12, borderRadius: "50%", background: C.inkSoft, opacity: 0.7 }} />)}
            </div>
            <svg width={84} height={84} viewBox="0 0 84 84" style={{ filter: `drop-shadow(0 0 12px ${C.glow})` }}>
              <circle cx={42} cy={42} r={36} fill={chk > 0.5 ? C.olive : C.sand} stroke={C.olive} strokeWidth={3} />
              <path d="M24 44 L37 57 L61 30" stroke={C.paper} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - chk} />
            </svg>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 52, color: C.ink }}>
              <span style={{ color: C.olive, marginLeft: 14 }}>{i + 1}.</span>
              {t}
            </div>
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
          fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: (v.text?.length ?? 0) > 10 ? 116 : 160, color: C.title, direction: /[\u0621-\u064A]/.test(v.text ?? "") ? "rtl" : "ltr", textShadow: `0 0 28px ${C.glow2}`,
          transform: `scale(${interpolate(o, [0, 1], [0.5, 1])}) rotate(${(1 - o) * -6}deg)`, opacity: Math.min(1, o * 1.5),
          ...glass(C.olive, true), borderRadius: 36, padding: "20px 60px 40px",
          whiteSpace: "nowrap",
        }}
      >
        {v.text}
      </div>
      {v.sub && <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 52, color: C.orange, opacity: ease(f, 16, 32), direction: "rtl" }}>{v.sub}</div>}
    </div>
  );
};

/**
 * 3D asset scene: a generated isometric render placed in depth.
 * Far layer = blurred, enlarged copy (depth of field); near layer = sharp render with a slow camera push
 * toward `focus` (0–1 image coords). Code-driven neon packets and tags sit on top in the same camera space.
 */
const AssetScene: React.FC<{ v: Visual }> = ({ v }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const W = v.width ?? 1300;
  const H = Math.round(W * (768 / 1376));
  const [fx, fy] = v.focus ?? [0.5, 0.5];
  const [z0, z1] = v.zoom ?? [1.0, 1.12];
  const push = interpolate(f, [0, durationInFrames], [z0, z1], { easing: EASE_IN_OUT, extrapolateRight: "clamp" });
  const shake = v.shake ? Math.sin(f * 1.9) * 3 * ease(f, 10, 30) : 0;
  const mask = "radial-gradient(ellipse 50% 50% at 50% 50%, black 62%, transparent 100%)";
  const P = v.packets;
  return (
    <div style={{ position: "relative", width: W, height: H, transform: `translateX(${shake}px)` }}>
      <Img
        src={staticFile(v.asset!.replace(/\.png$/, "_blur.jpg"))}
        style={{ position: "absolute", inset: 0, width: W, height: H, transform: `scale(${push * 1.25})`, transformOrigin: `${fx * 100}% ${fy * 100}%`, opacity: 0.55, maskImage: mask, WebkitMaskImage: mask }}
      />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }}>
        <Img src={staticFile(v.asset!)} style={{ width: W, height: H, maskImage: mask, WebkitMaskImage: mask, mixBlendMode: "lighten" }} />
        {P && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const t = ((f / 40 + i / 6) % 1);
              const ax = P.from[0] * W, ay = P.from[1] * H, bx = P.to[0] * W, by = P.to[1] * H;
              const mx = (ax + bx) / 2, my = Math.min(ay, by) - (P.lift ?? 0.15) * H;
              const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx;
              const y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by;
              return <rect key={i} x={x - 14} y={y - 9} width={28} height={18} rx={4} fill={i % 2 ? C.orange : C.olive} opacity={Math.sin(t * Math.PI) * ease(f, 12, 24)} style={{ filter: `drop-shadow(0 0 10px ${i % 2 ? C.glow2 : C.glow})` }} />;
            })}
          </svg>
        )}
      </div>
      {(v.tags ?? []).map((t, i) => {
        const o = ease(f, 14 + i * 8, 30 + i * 8, EASE_BACK);
        return (
          <div key={i} style={{ position: "absolute", left: Math.min(W - 190, Math.max(190, t.x * W)), top: t.y * H, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * o})`, opacity: o, whiteSpace: "nowrap" }}>
            <Chip text={t.text} color={t.accent ? C.orange : C.ink} size={44} o={1} />
          </div>
        );
      })}
    </div>
  );
};

export const VisualView: React.FC<{ v: Visual; words?: Word[] }> = ({ v, words = [] }) => {
  switch (v.type) {
    case "hero": return <Hero v={v} />;
    case "desk": return <Desk v={v} />;
    case "compare": return <Compare v={v} />;
    case "flow": return <Flow v={v} />;
    case "bars": return <Bars v={v} />;
    case "steps": return <Steps v={v} />;
    case "bigtext": return <BigText v={v} />;
    case "asset": return <AssetScene v={v} />;
    case "custom": return v.scene === "lag" ? <LagScene words={words} /> : null;
  }
};
