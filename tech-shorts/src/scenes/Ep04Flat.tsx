import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_IN_OUT, FONT_TITLE, FONT_UI } from "../theme";
import type { Word } from "../Episode";
import { Rig, Stamp, ease, lerp, rnd, useCue } from "./Ep01Flat";
import { Abs, BigWord, Chip, Gauge, Laptop, Progress, pop } from "./kit";

const cam = (f: number, d: number, a = 0.96, b = 1.06) => lerp(a, b, ease(f, 0, d, EASE_IN_OUT));
const num = (v: number, dec = 0) => v.toFixed(dec);

/** Plan card: "باقة 100 ميغا". */
const PlanCard: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <div style={{ width: 300 * s, padding: `${18 * s}px ${20 * s}px ${26 * s}px`, background: C.white, border: `${7 * s}px solid ${C.ink}`, borderRadius: 26 * s, boxShadow: `${12 * s}px ${12 * s}px 0 ${C.orange}`, textAlign: "center", direction: "rtl" }}>
    <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 34 * s, color: C.inkSoft }}>باقتك</div>
    <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 96 * s, lineHeight: 1.1, color: C.ink, direction: "ltr" }}>100</div>
    <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 38 * s, color: C.orange }}>ميغا</div>
  </div>
);

/* s1 — 100 Mb plan, download shows 12 */
export const MbPlanScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const PLAN = cue("بباقة", 24);
  const DL = cue("وبتنزّل", 69);
  const SPEED = cue("السرعة", 126);
  const TWELVE = cue("إتناعش", 144);
  const CHEAT = cue("انضحك", 186);
  const speed = interpolate(f, [SPEED, TWELVE + 4], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={240} y={330} s={pop(f, PLAN)} r={-6}><PlanCard s={0.9} /></Abs>
      <Abs x={640} y={520} s={pop(f, DL - 4)}>
        <Laptop w={420}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: C.paper }}>تنزيل ملف…</div>
            <div style={{ transform: "scale(0.75)" }}><Progress v={ease(f, DL, durationInFrames, EASE_IN_OUT) * 0.3} w={360} color={C.orange} /></div>
          </div>
        </Laptop>
      </Abs>
      {f > SPEED - 4 && (
        <Abs x={640} y={180} s={pop(f, SPEED - 4)}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, direction: "ltr", background: C.white, border: `7px solid ${C.ink}`, borderRadius: 24, padding: "6px 30px 14px", boxShadow: `10px 10px 0 ${C.shadow}` }}>
            <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: f > TWELVE ? C.orange : C.ink }}>{num(speed)}</span>
            <span style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: C.inkSoft }}>MB/s</span>
          </div>
        </Abs>
      )}
      <Abs x={260} y={720} s={pop(f, CHEAT)} r={Math.sin(f / 4) * 8}><BigWord text="؟!" size={140} accent /></Abs>
    </Rig>
  );
};

/* s2 — one letter: b vs B */
export const MbLetterScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const ONE = cue("بحرف", 45);
  const CO = cue("الشركة", 75);
  const BIT = cue("بِت", 129);
  const PC = cue("والكمبيوتر", 156);
  const BYTE = cue("بايت", 210);
  const card = (x: number, t0: number, who: string, unit: string, big: string, hot: boolean, tHot: number) => (
    <Abs x={x} y={520} s={pop(f, t0)}>
      <div style={{ width: 360, background: C.white, border: `7px solid ${C.ink}`, borderRadius: 28, boxShadow: `12px 12px 0 ${hot ? C.orange : C.oliveSoft}`, textAlign: "center", padding: "20px 10px 26px" }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 36, color: C.inkSoft }}>{who}</div>
        <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 150, lineHeight: 1.1, direction: "ltr", color: C.ink }}>
          M<span style={{ color: f > tHot ? C.orange : C.ink, display: "inline-block", transform: `scale(${1 + 0.35 * pop(f, tHot) * (f > tHot ? 1 : 0) - 0.35 * ease(f, tHot + 14, tHot + 24)})` }}>{big}</span>
        </div>
        <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: C.orange }}>{unit}</div>
      </div>
    </Abs>
  );
  return (
    <Rig s={1} x={Math.sin(f / 45) * 10} y={0}>
      {card(270, CO, "الشركة", "ميغا بِت", "b", f > BIT, BIT)}
      {card(730, PC, "جهازك", "ميغا بايت", "B", f > BYTE, BYTE)}
      <Abs x={500} y={150} s={pop(f, ONE)}><Chip text="الفرق بحرف واحد" accent /></Abs>
      {f > BYTE + 6 && <Abs x={500} y={800} s={pop(f, BYTE + 6)}><BigWord text="b ≠ B" size={110} ltr accent /></Abs>}
    </Rig>
  );
};

/* s3 — 8 bits = 1 byte → 100 ÷ 8 = 12.5 */
export const BitsByteScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const EIGHT = cue("تمانية", 57);
  const DIV = cue("بتقسم", 108);
  const RES = cue("إتناعش", 195);
  const merge = ease(f, EIGHT + 6, EIGHT + 28, EASE_IN_OUT);
  return (
    <Rig s={1} x={0} y={0}>
      {/* 8 bits */}
      {Array.from({ length: 8 }).map((_, i) => {
        const p = pop(f, 6 + i * 3);
        const bx = 140 + i * 102;
        const x = lerp(bx, 500, merge);
        const y = lerp(250, 300, merge);
        return (
          <Abs key={i} x={x} y={y} s={p * lerp(1, 0.4, merge)} o={1 - ease(f, EIGHT + 24, EIGHT + 30)}>
            <div style={{ width: 76, height: 76, borderRadius: 14, background: i % 2 ? C.olive : C.oliveSoft, border: `6px solid ${C.ink}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.paper }}>{i % 2 ? 1 : 0}</div>
          </Abs>
        );
      })}
      {f > 6 && f < EIGHT + 24 && <Abs x={500} y={130} s={pop(f, 10)}><Chip text="٨ بِت" /></Abs>}
      {/* the byte */}
      <Abs x={500} y={300} s={pop(f, EIGHT + 26)}>
        <div style={{ width: 170, height: 170, borderRadius: 26, background: C.orange, border: `8px solid ${C.ink}`, boxShadow: `12px 12px 0 ${C.shadow}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 46, color: C.paper }}>بايت</div>
      </Abs>
      {/* equation */}
      <Abs x={500} y={650} s={pop(f, DIV)}>
        <div style={{ display: "flex", gap: 22, alignItems: "center", direction: "ltr", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 120, color: C.ink }}>
          <span>100</span>
          <span style={{ color: C.orange, opacity: ease(f, DIV + 8, DIV + 14) }}>÷</span>
          <span style={{ opacity: ease(f, DIV + 14, DIV + 20) }}>8</span>
          <span style={{ opacity: ease(f, RES - 8, RES) }}>=</span>
          <span style={{ color: C.orange, display: "inline-block", transform: `scale(${pop(f, RES)})` }}>12.5</span>
        </div>
      </Abs>
    </Rig>
  );
};

/* s4 — 12.5 MB/s means full speed. Congrats! */
export const FullSpeedScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const AT = cue("بإتناعش", 39);
  const FULL = cue("كاملة", 117);
  const YAY = cue("مبروك", 141);
  const g = ease(f, AT, FULL + 6, EASE_IN_OUT);
  return (
    <Rig s={cam(f, 170, 1.0, 1.08)} x={0} y={0}>
      <Abs x={500} y={420} s={1.7 * pop(f, 4)}><Gauge v={g} label={`${num(g * 12.5, 1)} MB/s`} /></Abs>
      {f > FULL && <Abs x={500} y={720} s={pop(f, FULL)}><Chip text="= 100 ميغا بِت ✓" accent /></Abs>}
      {f > YAY &&
        Array.from({ length: 26 }).map((_, i) => {
          const t = (f - YAY) / 30;
          return <div key={i} style={{ position: "absolute", left: 500 + (rnd(i) - 0.5) * 900 * t, top: 300 + (rnd(i + 9) - 0.8) * 500 * t + 600 * t * t, width: 18, height: 26, background: [C.orange, C.olive, C.blue][i % 3], transform: `rotate(${t * 600 * (i % 2 ? 1 : -1)}deg)`, opacity: 1 - ease(t, 0.8, 1.4) }} />;
        })}
      <Stamp text="مبروك!" x={500} y={130} t0={YAY} size={70} />
    </Rig>
  );
};

/* s5 — check on Speedtest, mind the unit */
export const SpeedtestScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const OPEN = cue("افتح", 51);
  const UNIT = cue("للوحدة", 120);
  const run = ease(f, OPEN + 6, UNIT - 6, EASE_IN_OUT);
  const ring = ease(f, UNIT, UNIT + 14, EASE_IN_OUT);
  return (
    <Rig s={1} x={0} y={0}>
      <Abs x={500} y={480} s={pop(f, OPEN - 4)}>
        <div style={{ width: 640, height: 560, background: C.white, border: `8px solid ${C.ink}`, borderRadius: 34, boxShadow: `14px 14px 0 ${C.olive}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30, gap: 10 }}>
          <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 36, color: C.inkSoft, direction: "ltr" }}>Speedtest</div>
          <div style={{ transform: "scale(1.25)", marginTop: 20 }}><Gauge v={run * (0.85 + Math.sin(f / 3) * 0.04)} /></div>
          <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 14, direction: "ltr", marginTop: 26 }}>
            <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: C.ink }}>{num(run * 100)}</span>
            <span style={{ position: "relative", fontFamily: FONT_UI, fontWeight: 600, fontSize: 52, color: f > UNIT ? C.orange : C.inkSoft }}>
              Mbps
              <svg width={220} height={110} viewBox="0 0 220 110" style={{ position: "absolute", left: -40, top: -20, overflow: "visible" }}>
                <ellipse cx={110} cy={55} rx={100} ry={46} fill="none" stroke={C.orange} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
              </svg>
            </span>
          </div>
        </div>
      </Abs>
      {f > UNIT + 8 && <Abs x={500} y={110} s={pop(f, UNIT + 8)}><Chip text="انتبه للوحدة: بِت ولا بايت؟" accent size={38} /></Abs>}
    </Rig>
  );
};
