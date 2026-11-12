import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import timing from "../../adobe-news/timing.json";
import { BRAND, C, EASE_BACK, EASE_IN_OUT, EASE_OUT, FONT_HEAVY, FONT_TITLE, FONT_UI, setPalette } from "../theme";

/* =====================================================================
 * «أدوبي سلّمت برامجها للذكاء الاصطناعي» — trend/breaking-news short.
 * Style C (midnight) in a "عاجل" variant: huge kinetic type, mock app UI,
 * every beat cued to Mahmoud's VO word timings. Bezier only + motion blur.
 * =================================================================== */

const FPS = 30;
type W = { w: string; in: number; out: number };
const WORDS: W[] = timing.scenes.flatMap((s) => s.words as W[]);
export const NEWS_FRAMES = Math.ceil(timing.duration * FPS);
const CHUNKS: W[][] = timing.scenes.flatMap((s) => {
  const ws = s.words as W[];
  const out: W[][] = [];
  for (let i = 0; i < ws.length; i += 4) out.push(ws.slice(i, i + 4));
  return out;
});

const ease = (f: number, a: number, b: number, e = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pop = (f: number, t0: number, d = 12) => ease(f, t0, t0 + d, EASE_BACK);
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** frame where a word starts (searched from `after` seconds) */
const cue = (needle: string, after = 0) => Math.round((WORDS.find((w) => w.in >= after - 0.01 && w.w.includes(needle))?.in ?? 0) * FPS);
const SC = timing.scenes.map((s) => ({ a: Math.round(s.in * FPS) - 6, b: Math.round(s.out * FPS) + 4 }));
SC[0].a = 0;
SC[5].b = NEWS_FRAMES;

/* ---------- shared bits ---------- */
const Abs: React.FC<{ x: number; y: number; s?: number; r?: number; o?: number; children: React.ReactNode }> = ({ x, y, s = 1, r = 0, o = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${r}deg) scale(${s})`, opacity: o }}>{children}</div>
);
const Card: React.FC<{ children: React.ReactNode; accent?: string; w?: number; pad?: string }> = ({ children, accent = C.olive, w, pad = "26px 30px" }) => (
  <div style={{ width: w, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 28, boxShadow: `12px 12px 0 ${accent}`, padding: pad }}>{children}</div>
);
const Badge: React.FC<{ t: string; c: string; s?: number }> = ({ t, c, s = 1 }) => (
  <div style={{ width: 130 * s, height: 130 * s, borderRadius: 30 * s, background: C.white, border: `${7 * s}px solid ${C.ink}`, boxShadow: `${8 * s}px ${8 * s}px 0 ${c}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 58 * s, color: c, direction: "ltr" }}>{t}</div>
);
const Strike: React.FC<{ t: number; w: number }> = ({ t, w }) => (
  <svg width={w} height={80} viewBox={`0 0 ${w} 80`} style={{ position: "absolute", left: 0, top: "50%", marginTop: -40, overflow: "visible" }}>
    <path d={`M0 52 L${w} 28`} stroke={C.orange} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
  </svg>
);
const Huge: React.FC<{ t: string; size: number; color?: string; o?: number }> = ({ t, size, color = C.ink, o = 1 }) => (
  <div style={{ fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: size, lineHeight: 1.15, color, whiteSpace: "nowrap", direction: "rtl", opacity: o, textShadow: `8px 8px 0 ${C.shadow}` }}>{t}</div>
);

/** Scene wrapper: whip-in (scale + blur) and whip-out, camera push inside. */
const Scene: React.FC<{ i: number; children: (f: number) => React.ReactNode }> = ({ i, children }) => {
  const f = useCurrentFrame();
  const { a, b } = SC[i];
  if (f < a || f > b + 6) return null;
  const inn = ease(f, a, a + 9);
  const out = ease(f, b - 2, b + 6, EASE_IN_OUT);
  const push = lerp(1, 1.05, ease(f, a, b, EASE_IN_OUT));
  return (
    <AbsoluteFill style={{ transform: `scale(${push * lerp(1.25, 1, inn) * lerp(1, 0.8, out)}) translateY(${(1 - inn) * 60}px)`, filter: `blur(${(1 - inn) * 18 + out * 18}px)`, opacity: Math.min(inn * 1.5, 1 - out) }}>
      {children(f)}
    </AbsoluteFill>
  );
};

/* ---------- SC1 — hook: "Adobe" slam, "normal update" struck, programs → AI ---------- */
const S1: React.FC = () => (
  <Scene i={0}>
    {(f) => {
      const A1 = cue("أدوبي");
      const NORMAL = cue("عادي");
      const HAND = cue("سلّمت");
      const AI = cue("للذكاء");
      const slam = pop(f, A1 - 4, 10);
      const scatter = ease(f, HAND, AI, EASE_IN_OUT);
      const glitch = f < 10 ? (1 - f / 10) : 0;
      return (
        <>
          {/* glitch intro bars */}
          {Array.from({ length: 10 }).map((_, k) => (
            <div key={k} style={{ position: "absolute", left: 0, right: 0, top: rnd(k + Math.floor(f / 2)) * 1920, height: 30 + rnd(k) * 90, background: k % 2 ? C.olive : C.orange, opacity: glitch * 0.6, transform: `translateX(${(rnd(k + f) - 0.5) * 300}px)` }} />
          ))}
          <Abs x={540} y={700} s={lerp(3, 1, slam)} o={Math.min(1, slam * 2) * (1 - scatter * 0.6)}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 6 * glitch * 4, top: 0, opacity: 0.6 }}><Huge t="أدوبي" size={260} color={C.olive} /></div>
              <Huge t="أدوبي" size={260} />
            </div>
          </Abs>
          <Abs x={540} y={960} s={pop(f, NORMAL - 14)} o={1 - scatter}>
            <div style={{ position: "relative" }}>
              <Huge t="تحديث عادي؟" size={110} color={C.inkSoft} />
              <Strike t={ease(f, NORMAL, NORMAL + 8)} w={560} />
            </div>
          </Abs>
          {/* "برامجها" letters scatter into particles that gather into AI */}
          {f >= HAND - 4 &&
            Array.from({ length: 36 }).map((_, k) => {
              const sx = 300 + rnd(k) * 480, sy = 1150 + rnd(k + 7) * 80;
              const tx = 540 + Math.cos(k) * 120 * (1 - scatter), ty = 1100 + Math.sin(k * 1.7) * 90 * (1 - scatter);
              const mid = Math.sin(scatter * Math.PI);
              return (
                <div key={k} style={{ position: "absolute", left: lerp(sx, tx, scatter) + (rnd(k + 3) - 0.5) * 400 * mid, top: lerp(sy, ty, scatter) + (rnd(k + 5) - 0.5) * 300 * mid, width: 16, height: 16, borderRadius: 4, background: k % 3 ? C.olive : C.orange, opacity: 1 - ease(f, AI + 6, AI + 12), transform: `rotate(${f * 9 + k * 20}deg)` }} />
              );
            })}
          <Abs x={540} y={1180} s={pop(f, HAND - 6)} o={1 - ease(f, HAND, HAND + 6)}><Huge t="برامجها" size={120} /></Abs>
          <Abs x={540} y={1110} s={pop(f, AI + 4, 14)} r={lerp(-12, 0, ease(f, AI + 4, AI + 16))}>
            <div style={{ fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 300, color: C.orange, direction: "ltr", textShadow: `12px 12px 0 ${C.ink}`, lineHeight: 1 }}>AI</div>
          </Abs>
        </>
      );
    }}
  </Scene>
);

/* ---------- SC2 — the assistant inside Premiere & After Effects ---------- */
const S2: React.FC = () => (
  <Scene i={1}>
    {(f) => {
      const IN = SC[1].a;
      const PR = cue("بريمير", 5);
      const AE = cue("وأفتر", 5);
      const DO = cue("وبينفّذ", 5);
      const panel = ease(f, IN, IN + 16, EASE_BACK);
      const prompt = "رتّبلي المشروع ولوّن السيكوانس";
      const typed = Math.floor(ease(f, IN + 12, DO - 30) * prompt.length);
      const done = pop(f, DO);
      return (
        <>
          <Abs x={540} y={820} s={panel} r={lerp(-8, 0, panel)}>
            <div style={{ transform: `perspective(1400px) rotateY(${(1 - panel) * 35}deg)` }}>
              <Card w={820} accent={done > 0.5 ? C.olive : C.orange} pad="0">
                <div style={{ display: "flex", gap: 12, padding: "18px 24px", borderBottom: `6px solid ${C.ink}`, background: C.sand, direction: "ltr", alignItems: "center" }}>
                  {[0, 1, 2].map((k) => <div key={k} style={{ width: 18, height: 18, borderRadius: 9, background: k === 0 ? C.orange : C.inkSoft }} />)}
                  <div style={{ marginLeft: 16, fontFamily: FONT_UI, fontWeight: 600, fontSize: 32, color: C.ink }}>AI Assistant</div>
                  <div style={{ marginLeft: "auto", fontFamily: FONT_UI, fontWeight: 600, fontSize: 26, color: C.paper, background: C.orange, borderRadius: 999, padding: "2px 18px 6px", transform: `scale(${done})` }}>Beta</div>
                </div>
                <div style={{ padding: 34, minHeight: 360, display: "flex", flexDirection: "column", gap: 26, direction: "rtl" }}>
                  <div style={{ alignSelf: "flex-start", maxWidth: 640, background: C.oliveSoft, border: `5px solid ${C.ink}`, borderRadius: "28px 28px 8px 28px", padding: "16px 26px 22px", fontFamily: FONT_UI, fontWeight: 600, fontSize: 46, color: C.ink }}>
                    {prompt.slice(0, typed)}
                    <span style={{ opacity: f % 16 < 8 && typed < prompt.length ? 1 : 0 }}>|</span>
                  </div>
                  <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 18, transform: `scale(${done})`, transformOrigin: "100% 50%" }}>
                    <div style={{ width: 80, height: 80, borderRadius: 40, background: C.olive, border: `5px solid ${C.ink}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, color: C.paper }}>✓</div>
                    <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: C.olive }}>تمّ التنفيذ</div>
                  </div>
                </div>
              </Card>
            </div>
          </Abs>
          <Abs x={300} y={1290} s={pop(f, PR)} r={-6}><Badge t="Pr" c={C.blue} /></Abs>
          <Abs x={780} y={1290} s={pop(f, AE)} r={6}><Badge t="Ae" c={C.olive} /></Abs>
        </>
      );
    }}
  </Scene>
);

/* ---------- SC3 — thousands of layers organised, expression without code ---------- */
const S3: React.FC = () => (
  <Scene i={2}>
    {(f) => {
      const IN = SC[2].a;
      const ORG = cue("ألوف", 11) + 10;
      const EXP = cue("الإكسبريشن", 11);
      const NOCODE = cue("بلا", 11);
      const order = ease(f, ORG, ORG + 26, EASE_IN_OUT);
      const code = "wiggle(2, 30)";
      const typed = Math.floor(ease(f, EXP - 6, EXP + 14) * code.length);
      return (
        <>
          {Array.from({ length: 40 }).map((_, k) => {
            const cx = 540 + (rnd(k) - 0.5) * 900, cy = 760 + (rnd(k + 11) - 0.5) * 700;
            const row = k % 20, col = Math.floor(k / 20);
            const ox = 290 + col * 500, oy = 470 + row * 30;
            const st = ease(f, ORG + row * 0.8, ORG + 18 + row * 0.8, EASE_IN_OUT) * order;
            return (
              <div key={k} style={{ position: "absolute", left: lerp(cx, ox, st) - 220, top: lerp(cy, oy, st), width: 440, height: 22, borderRadius: 6, background: [C.olive, C.blue, C.orange, C.oliveSoft][k % 4], border: `3px solid ${C.ink}`, transform: `rotate(${lerp((rnd(k + 2) - 0.5) * 80, 0, st)}deg)`, opacity: ease(f, IN + k * 0.4, IN + 8 + k * 0.4) }} />
            );
          })}
          <Abs x={540} y={330} s={pop(f, ORG - 8)}><Huge t="ألوف الطبقات" size={100} color={C.orange} /></Abs>
          <Abs x={540} y={1240} s={pop(f, EXP - 8)}>
            <div style={{ position: "relative" }}>
              <Card accent={C.olive}>
                <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 64, color: C.olive, direction: "ltr", minWidth: 470, whiteSpace: "nowrap" }}>
                  {code.slice(0, typed)}
                  <span style={{ opacity: f % 14 < 7 ? 1 : 0, color: C.ink }}>▌</span>
                </div>
              </Card>
              <Strike t={ease(f, NOCODE, NOCODE + 8)} w={540} />
            </div>
          </Abs>
          {f > NOCODE + 6 && Array.from({ length: 10 }).map((_, k) => <Abs key={k} x={540 + Math.cos(k) * lerp(0, 380, ease(f, NOCODE + 6, NOCODE + 20))} y={1240 + Math.sin(k * 1.3) * lerp(0, 160, ease(f, NOCODE + 6, NOCODE + 20))} s={1 - ease(f, NOCODE + 14, NOCODE + 24)}><div style={{ fontFamily: FONT_TITLE, fontSize: 60, color: C.orange }}>✦</div></Abs>)}
          <Abs x={540} y={1420} s={pop(f, NOCODE + 4)}><Huge t="بلا كود" size={96} color={C.orange} /></Abs>
        </>
      );
    }}
  </Scene>
);

/* ---------- SC4 — Premiere timeline generates SFX + video ---------- */
const S4: React.FC = () => (
  <Scene i={3}>
    {(f) => {
      const IN = SC[3].a;
      const GEN = cue("بيولّد", 15);
      const SFX = cue("مؤثرات", 15);
      const VID = cue("وفيديو", 15);
      const wipe = ease(f, GEN, GEN + 18, EASE_IN_OUT);
      const wave = ease(f, SFX, SFX + 16, EASE_IN_OUT);
      const tl = ease(f, IN, IN + 14, EASE_BACK);
      const playhead = lerp(120, 940, ease(f, IN + 6, SC[3].b, EASE_IN_OUT));
      return (
        <>
          <Abs x={540} y={400} s={pop(f, IN + 2)}><Huge t="جوّا التايم لاين" size={104} /></Abs>
          <div style={{ position: "absolute", left: 60, top: 600, width: 960, transform: `translateX(${(1 - tl) * -1100}px)` }}>
            <Card accent={C.orange} pad="24px 24px 30px">
              <div style={{ position: "relative", height: 560, direction: "ltr" }}>
                {["V2", "V1", "A1"].map((t, k) => (
                  <div key={t} style={{ position: "absolute", left: 0, right: 0, top: 30 + k * 175, height: 150, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 70, fontFamily: FONT_UI, fontWeight: 600, fontSize: 32, color: C.inkSoft }}>{t}</div>
                    <div style={{ flex: 1, height: 130, borderRadius: 14, background: C.paper, border: `4px solid ${C.grid}`, position: "relative", overflow: "hidden" }}>
                      {k === 1 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "38%", background: C.blue, borderRight: `4px solid ${C.ink}` }} />}
                      {k === 0 && (
                        <div style={{ position: "absolute", left: "38%", top: 0, bottom: 0, width: `${wipe * 46}%`, background: `linear-gradient(90deg, ${C.olive}, ${C.oliveSoft})`, display: "flex", gap: 8, alignItems: "center", paddingLeft: 10 }}>
                          {[0, 1, 2].map((q) => <div key={q} style={{ width: 120, height: 90, borderRadius: 8, background: C.white, border: `4px solid ${C.ink}`, transform: `scale(${pop(f, VID + q * 4)})` }} />)}
                        </div>
                      )}
                      {k === 2 && (
                        <svg width={820} height={130} viewBox="0 0 820 130" style={{ position: "absolute", left: 0, top: 0 }}>
                          <path d={Array.from({ length: 80 }).map((_, q) => `M${310 + q * 6} ${65 - (8 + rnd(q) * 46)} V${65 + (8 + rnd(q) * 46)}`).join(" ")} stroke={C.orange} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - wave} />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
                <div style={{ position: "absolute", left: playhead, top: 0, bottom: 0, width: 6, background: C.orange }} />
              </div>
            </Card>
          </div>
          <Abs x={300} y={1340} s={pop(f, SFX)} r={-4}><div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: C.paper, background: C.orange, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "6px 30px 12px" }}>+ مؤثرات</div></Abs>
          <Abs x={780} y={1340} s={pop(f, VID)} r={4}><div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: C.paper, background: C.olive, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "6px 30px 12px" }}>+ فيديو</div></Abs>
        </>
      );
    }}
  </Scene>
);

/* ---------- SC5 — 2027: Adobe opens its apps to any AI agent ---------- */
const S5: React.FC = () => (
  <Scene i={4}>
    {(f) => {
      const DANGER = cue("والأخطر", 20);
      const YEAR = cue("بألفين", 20);
      const OPEN = cue("تفتح", 20);
      const ANY = cue("لأي", 20);
      const yr = pop(f, YEAR, 9);
      const lock = ease(f, OPEN, OPEN + 10, EASE_BACK);
      const apps = [["Ps", C.blue], ["Ai", C.orange], ["Pr", C.blue], ["Ae", C.olive]] as const;
      return (
        <>
          <AbsoluteFill style={{ background: "#000", opacity: 0.45 * ease(f, DANGER, DANGER + 8) * (1 - ease(f, OPEN, OPEN + 10)) }} />
          <Abs x={540} y={330} s={pop(f, DANGER - 4)}><Huge t="والأخطر…" size={96} color={C.orange} /></Abs>
          {/* extruded 2027 */}
          <Abs x={540} y={650} s={lerp(2.6, 1, yr) * (1 - 0.35 * ease(f, OPEN - 6, OPEN + 6, EASE_IN_OUT))} o={Math.min(1, yr * 2)}>
            <div style={{ position: "relative", fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 280, lineHeight: 1, direction: "ltr" }}>
              {Array.from({ length: 10 }).map((_, k) => <div key={k} style={{ position: "absolute", left: k * 2.4, top: k * 2.4, color: k === 9 ? C.ink : C.oliveSoft }}>2027</div>)}
              <div style={{ position: "relative", color: C.orange }}>2027</div>
            </div>
          </Abs>
          {/* lock opening */}
          <Abs x={540} y={1010} s={pop(f, OPEN - 8)}>
            <svg width={200} height={230} viewBox="0 0 200 230">
              <g transform={`translate(${lock * 40} ${-lock * 30}) rotate(${lock * 25} 150 90)`}>
                <path d="M50 110 V70 A50 50 0 0 1 150 70 V110" fill="none" stroke={C.ink} strokeWidth={20} strokeLinecap="round" />
              </g>
              <rect x={20} y={100} width={160} height={120} rx={20} fill={lock > 0.5 ? C.olive : C.orange} stroke={C.ink} strokeWidth={9} />
              <circle cx={100} cy={150} r={14} fill={C.ink} />
            </svg>
          </Abs>
          {/* app badges linked to an agent node */}
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
            {apps.map((_, k) => <path key={k} d={`M${180 + k * 240} 1240 Q540 1180 540 1390`} stroke={C.olive} strokeWidth={6} fill="none" strokeDasharray="14 12" strokeDashoffset={-f * 2} opacity={ease(f, ANY - 4, ANY + 6)} />)}
          </svg>
          {apps.map(([t, c], k) => <Abs key={t} x={180 + k * 240} y={1180} s={pop(f, OPEN + 4 + k * 4) * 0.8}><Badge t={t} c={c} /></Abs>)}
          <Abs x={540} y={1400} s={pop(f, ANY)}>
            <div style={{ width: 170, height: 170, borderRadius: 85, background: C.orange, border: `8px solid ${C.ink}`, boxShadow: `10px 10px 0 ${C.ink}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: C.paper, direction: "ltr" }}>Agent</div>
          </Abs>
          <Abs x={540} y={1560} s={pop(f, ANY + 8)}><div style={{ fontFamily: FONT_UI, fontSize: 30, color: C.inkSoft, direction: "ltr" }}>Local MCP · Private Beta · early 2027</div></Abs>
        </>
      );
    }}
  </Scene>
);

/* ---------- SC6 — the editor won't vanish; the one who talks to tools wins ---------- */
const S6: React.FC = () => (
  <Scene i={5}>
    {(f) => {
      const ED = cue("المونتير", 27);
      const VAN = cue("يختفي", 27);
      const WIN = cue("يسبق", 27);
      const FOL = cue("تابعني", 27);
      const race = ease(f, WIN - 6, WIN + 16, EASE_IN_OUT);
      const outro = ease(f, FOL - 4, FOL + 10, EASE_BACK);
      return (
        <>
          <div style={{ opacity: 1 - ease(f, FOL - 6, FOL + 2) }}>
            <Abs x={540} y={420} s={pop(f, ED)}>
              <div style={{ position: "relative" }}>
                <Huge t="المونتير رح يختفي؟" size={88} />
                <Strike t={ease(f, VAN + 6, VAN + 14)} w={300} />
              </div>
            </Abs>
            {/* race lanes */}
            {[["بيدوّر بالقوائم", 820, C.inkSoft, 0.45], ["بيحكي مع الأدوات", 1060, C.orange, 1]].map(([t, y, c, sp], k) => (
              <React.Fragment key={k}>
                <div style={{ position: "absolute", left: 90, right: 90, top: (y as number) - 4, height: 8, background: C.grid, borderRadius: 4 }} />
                <Abs x={lerp(270, lerp(270, 860, sp as number), race)} y={(y as number) - 70} s={pop(f, ED + 10 + k * 6)}>
                  <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 40, color: k ? C.paper : C.ink, background: k ? (c as string) : C.white, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "6px 26px 12px", whiteSpace: "nowrap" }}>{t as string}</div>
                </Abs>
              </React.Fragment>
            ))}
            <Abs x={820} y={1200} s={pop(f, WIN + 10)} r={-6}><Huge t="يسبق الكل!" size={84} color={C.orange} /></Abs>
          </div>
          {/* outro */}
          <Abs x={540} y={820} s={outro} o={outro}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
              <div style={{ width: 200, height: 200, borderRadius: 56, background: C.orange, color: C.paper, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 150, paddingBottom: 26, boxShadow: `14px 14px 0 ${C.ink}` }}>؟</div>
              <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 92, color: C.ink }}>{BRAND.series}</div>
              <div style={{ fontFamily: FONT_UI, fontSize: 44, color: C.inkSoft }}>إعداد وتقديم: {BRAND.author}</div>
              <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 46, color: C.paper, background: C.olive, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "8px 40px 14px", marginTop: 10 }}>تابعني</div>
            </div>
          </Abs>
        </>
      );
    }}
  </Scene>
);

/* ---------- frame: background, breaking bar + ticker, signature, captions ---------- */
const Back: React.FC = () => {
  const f = useCurrentFrame();
  const YEAR = cue("بألفين", 20);
  const jolt = Math.max(f >= cue("أدوبي") ? Math.exp(-(f - cue("أدوبي")) / 6) : 0, f >= YEAR ? Math.exp(-(f - YEAR) / 6) : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ inset: -120, backgroundImage: `radial-gradient(${C.grid} 3px, transparent 3.5px)`, backgroundSize: "48px 48px", transform: `translate(${Math.sin(f / 60) * 20 + jolt * Math.sin(f * 2.3) * 16}px, ${-(f * 0.4) % 48}px)` }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("fx/grain.png")})`, backgroundSize: "512px 512px", backgroundPosition: `${(f * 137) % 512}px ${(f * 251) % 512}px`, opacity: 0.08, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 50%, ${C.vignette} 100%)` }} />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const o = ease(f, 4, 16);
  const ticker = "Creative Agent  •  AI Assistant (Beta)  •  Generative Media  •  Local MCP — Private Beta 2027  •  ";
  const t = f / FPS;
  const w = WORDS.filter((x) => x.in <= t + 0.02);
  const cur = WORDS.findIndex((x) => t >= x.in - 0.03 && t < x.out + 0.08);
  // chunks of ≤4 words that never cross a scene boundary
  const last = w[w.length - 1];
  const chunk = last ? (CHUNKS.find((c) => c.includes(last)) ?? []).filter((x) => x.in <= t + 0.02) : [];
  const outroOn = t > (WORDS.find((x) => x.w.includes("تابعني"))?.in ?? 99) - 0.2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* breaking bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 92, display: "flex", direction: "rtl", opacity: o, transform: `translateY(${(1 - o) * -120}px)` }}>
        <div style={{ background: C.orange, color: C.paper, fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 52, padding: "6px 34px 0", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: C.paper, opacity: f % 20 < 12 ? 1 : 0.2 }} />
          عاجل
        </div>
        <div style={{ flex: 1, background: C.white, borderTop: `5px solid ${C.ink}`, borderBottom: `5px solid ${C.ink}`, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 16, left: -((f * 5) % 1400), whiteSpace: "nowrap", fontFamily: FONT_UI, fontWeight: 600, fontSize: 36, color: C.ink, direction: "ltr" }}>{ticker + ticker + ticker}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 172, right: 40, fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: C.orange, border: `3px solid ${C.orange}`, borderRadius: 999, padding: "2px 22px 6px", opacity: o, direction: "ltr" }}>ADOBE MAX 2026</div>
      <div style={{ position: "absolute", top: 172, left: 40, display: "flex", gap: 12, alignItems: "center", opacity: o, direction: "rtl" }}>
        <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 32, color: C.ink }}>{BRAND.series}</div>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: C.orange, color: C.paper, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 34, paddingBottom: 6 }}>؟</div>
      </div>
      {/* centred signature (anti-theft) */}
      <div style={{ position: "absolute", top: 1650, left: 0, right: 0, textAlign: "center", fontFamily: FONT_UI, fontSize: 30, color: C.dim, direction: "rtl", opacity: o * (outroOn ? 0 : 1) }}>
        {BRAND.series} · {BRAND.author}
      </div>
      {/* captions */}
      {!outroOn && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1700, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 16px", direction: "rtl" }}>
          {chunk.map((x) => {
            const i = WORDS.indexOf(x);
            const r = ease(f, x.in * FPS - 3, x.in * FPS + 4);
            const active = i === cur;
            return (
              <span key={i} style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 62, lineHeight: 1.45, color: active ? C.orange : C.ink, opacity: r, transform: `translateY(${(1 - r) * 18}px)`, display: "inline-block", borderBottom: `6px solid ${active ? C.orange : "transparent"}` }}>
                {x.w.replace(/[،.:!]$/, "")}
              </span>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Body: React.FC = () => (
  <AbsoluteFill>
    <Back />
    <S1 />
    <S2 />
    <S3 />
    <S4 />
    <S5 />
    <S6 />
    <Hud />
  </AbsoluteFill>
);

export const AdobeNews: React.FC<{ motionBlur: boolean }> = ({ motionBlur }) => {
  setPalette("midnight");
  return (
    <AbsoluteFill>
      {motionBlur ? (
        <CameraMotionBlur shutterAngle={180} samples={4}>
          <Body />
        </CameraMotionBlur>
      ) : (
        <Body />
      )}
      {/* A1 voice-over. A2 SFX + A3 music intentionally empty — see adobe-news/markers.csv */}
      <Sequence from={0} name="VO محمود">
        <Audio src={staticFile("news/adobe/VO.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};
