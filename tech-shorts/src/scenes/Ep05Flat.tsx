import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, FONT_TITLE, FONT_UI } from "../theme";
import type { Word } from "../Episode";
import { Rig, Stamp, ease, lerp, useCue } from "./Ep01Flat";
import { Abs, BigWord, Chip, Cursor, Laptop, Phone, Progress, Ripple, Strike, Virus, pop } from "./kit";

const cam = (f: number, d: number, a = 0.96, b = 1.06) => lerp(a, b, ease(f, 0, d, EASE_IN_OUT));

/** Laptop whose screen is a door that opens (0..1). */
const DoorLaptop: React.FC<{ open: number }> = ({ open }) => (
  <Laptop w={460}>
    <div style={{ position: "absolute", inset: 0, background: C.ink }} />
    <div style={{ position: "absolute", left: "50%", top: 30, width: 150, height: 210, marginLeft: -75, background: "#0B1622", border: `6px solid ${C.paper}`, borderRadius: 8 }}>
      <div style={{ position: "absolute", inset: -6, background: C.sand, border: `6px solid ${C.ink}`, borderRadius: 8, transformOrigin: "0 50%", transform: `perspective(600px) rotateY(${-open * 110}deg)` }}>
        <div style={{ position: "absolute", right: 16, top: "50%", width: 14, height: 14, borderRadius: 7, background: C.ink }} />
      </div>
    </div>
  </Laptop>
);

/* s1 — the virus doesn't break in; you open the door for it */
export const VirusDoorScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const BREAK = cue("بيكسر", 39);
  const TRUTH = cue("بالحقيقة", 102);
  const YOU = cue("إنت", 165);
  const OPEN = cue("بتفتحلو", 192);
  const knock = f > BREAK && f < TRUTH ? Math.abs(Math.sin(f / 2.5)) : 0;
  const open = ease(f, OPEN - 6, OPEN + 10, EASE_BACK);
  const walk = ease(f, OPEN + 4, durationInFrames, EASE_IN_OUT);
  const curT = ease(f, YOU - 6, OPEN - 4, EASE_IN_OUT);
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={540} y={520} s={pop(f, 2)}><DoorLaptop open={open} /></Abs>
      <Abs x={lerp(220, 540, walk)} y={lerp(560, 470, walk) - knock * 10} s={lerp(1, 0.4, walk)} o={1 - ease(f, durationInFrames - 8, durationInFrames)} r={knock * -14}>
        <Virus s={1.1} walk={f > OPEN ? 1 : 0} />
      </Abs>
      {f > BREAK && f < TRUTH && <Abs x={380} y={380} s={knock}><BigWord text="!" size={90} accent /></Abs>}
      {f > BREAK + 4 && f < TRUTH && <Abs x={300} y={170} s={pop(f, BREAK + 4)}><Chip text="بيكسر الباب؟" /></Abs>}
      <Abs x={lerp(980, 640, curT)} y={lerp(900, 470, curT)} o={ease(f, YOU - 8, YOU)}><Cursor press={f > OPEN - 6 && f < OPEN + 2 ? 1 : 0} /></Abs>
      {f > YOU && <Abs x={700} y={170} s={pop(f, YOU)}><Chip text="إنت اللي فتحت!" accent /></Abs>}
    </Rig>
  );
};

/* s2 — cracked software hides something */
export const CrackedBoxScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const CRACK = cue("مكركر", 51);
  const GAME = cue("لعبة", 93);
  const HIDE = cue("مخبّى", 171);
  const lid = ease(f, HIDE - 8, HIDE + 10, EASE_BACK);
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={500} y={520} s={pop(f, GAME - 10)}>
        <div style={{ position: "relative", width: 380, height: 340 }}>
          {/* virus peeking */}
          <div style={{ position: "absolute", left: 120, top: lerp(140, -10, lid), opacity: lid }}><Virus s={0.95} /></div>
          {/* box */}
          <div style={{ position: "absolute", left: 0, top: 110, width: 380, height: 230, background: C.olive, border: `8px solid ${C.ink}`, borderRadius: 18, boxShadow: `12px 12px 0 ${C.shadow}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 48, color: C.paper }}>
            GAME
          </div>
          <div style={{ position: "absolute", left: -10, top: 80, width: 400, height: 50, background: C.oliveSoft, border: `8px solid ${C.ink}`, borderRadius: 12, transformOrigin: "0 100%", transform: `rotate(${-lid * 70}deg)` }} />
        </div>
      </Abs>
      {f > CRACK - 4 && (
        <Abs x={500} y={150} s={pop(f, CRACK - 4)} r={-4}>
          <div style={{ position: "relative" }}><Chip text="مجاني!! (مكركر)" accent /></div>
        </Abs>
      )}
      <Abs x={830} y={330} s={pop(f, GAME + 6)} r={10}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderTop: `40px solid ${C.orange}` }} />
          <div style={{ width: 80, height: 14, background: C.ink, borderRadius: 7 }} />
        </div>
      </Abs>
      <Stamp text="مخبّى شي تاني" x={500} y={790} t0={HIDE + 6} size={52} />
    </Rig>
  );
};

/* s3 — a link in a message: prize or warning → click → download starts */
export const PhishLinkScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const MSG = cue("بيوصلك", 78);
  const PRIZE = cue("جايزة", 117);
  const WARN = cue("تحذير", 132);
  const CLICK = cue("تضغط", 180);
  const DL = cue("التحميل", 201);
  const curT = ease(f, WARN + 6, CLICK, EASE_IN_OUT);
  return (
    <Rig s={1} x={0} y={0}>
      <Abs x={380} y={480} s={1.5 * pop(f, 4)}>
        <Phone bars={4}>
          <div style={{ position: "absolute", left: 8, right: 8, top: 40, transform: `scale(${pop(f, MSG)})`, transformOrigin: "0 0", background: C.white, border: `3px solid ${C.ink}`, borderRadius: 10, padding: 6, direction: "rtl" }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 11, color: C.ink }}>مبروك! ربحت 🎁</div>
            <div style={{ fontFamily: FONT_UI, fontSize: 10, color: C.orange, textDecoration: "underline", direction: "ltr" }}>bit.ly/fr33-g1ft</div>
          </div>
          {f > DL && (
            <div style={{ position: "absolute", left: 8, right: 8, bottom: 30, transform: "scale(0.28)", transformOrigin: "0 100%" }}>
              <Progress v={ease(f, DL, DL + 30)} w={400} color={C.orange} />
            </div>
          )}
        </Phone>
      </Abs>
      <Abs x={780} y={300} s={pop(f, PRIZE)} r={8}>
        <svg width={170} height={170} viewBox="0 0 170 170">
          <rect x={20} y={70} width={130} height={90} rx={8} fill={C.orange} stroke={C.ink} strokeWidth={8} />
          <rect x={10} y={46} width={150} height={34} rx={6} fill={C.orange} stroke={C.ink} strokeWidth={8} />
          <path d="M85 46 V160" stroke={C.ink} strokeWidth={10} />
          <path d="M85 46 C60 10 30 30 50 46 M85 46 C110 10 140 30 120 46" stroke={C.ink} strokeWidth={8} fill="none" />
        </svg>
      </Abs>
      <Abs x={780} y={560} s={pop(f, WARN)} r={-6}>
        <svg width={170} height={150} viewBox="0 0 170 150">
          <path d="M85 10 L160 140 H10 Z" fill={C.olive} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <path d="M85 55 V95" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
          <circle cx={85} cy={118} r={8} fill={C.ink} />
        </svg>
      </Abs>
      <Abs x={lerp(900, 420, curT)} y={lerp(900, 480, curT)} o={ease(f, WARN + 4, WARN + 10)}><Cursor press={f > CLICK - 4 && f < CLICK + 4 ? 1 : 0} /></Abs>
      <div style={{ position: "absolute", left: 400, top: 470 }}><Ripple t0={CLICK} /></div>
      {f > DL && <Abs x={380} y={130} s={pop(f, DL)}><Chip text="بيبلّش التحميل…" accent /></Abs>}
    </Rig>
  );
};

/* s4 — a friend's USB stick: the virus copies itself over */
export const UsbScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const USB = cue("فلاشة", 39);
  const PLUG = cue("بتحطّها", 75);
  const MOVE = cue("بينقل", 117);
  const plug = ease(f, PLUG, PLUG + 12, EASE_BACK);
  const crawl = ease(f, MOVE - 6, durationInFrames, EASE_IN_OUT);
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={360} y={520}><Laptop w={460}><div style={{ position: "absolute", inset: 0, background: f > MOVE + 20 ? C.orangeSoft : C.oliveSoft }} /></Laptop></Abs>
      <Abs x={lerp(980, 790, plug)} y={640} s={pop(f, USB)} r={lerp(20, 0, plug)}>
        <svg width={220} height={90} viewBox="0 0 220 90">
          <rect x={0} y={20} width={60} height={50} fill={C.white} stroke={C.ink} strokeWidth={7} />
          <rect x={56} y={4} width={160} height={82} rx={18} fill={C.olive} stroke={C.ink} strokeWidth={8} />
        </svg>
      </Abs>
      {[0, 1, 2].map((k) => {
        const t = Math.max(0, Math.min(1, crawl * 1.3 - k * 0.15));
        return f > MOVE - 6 ? (
          <Abs key={k} x={lerp(860, 420 + k * 40, t)} y={lerp(600, 470 - k * 30, t) - Math.abs(Math.sin((f + k * 6) / 4)) * 10} s={0.45}>
            <Virus walk={1} />
          </Abs>
        ) : null;
      })}
      {f > USB + 6 && <Abs x={760} y={360} s={pop(f, USB + 6)}><Chip text="فلاشة من حدا" /></Abs>}
    </Rig>
  );
};

/* s5 — un-updated device: known holes, hackers know them */
export const HolesScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const NOUPD = cue("بيتحدّث", 66);
  const HOLES = cue("ثغرات", 96);
  const HACK = cue("والهكر", 132);
  const holes: [number, number][] = [[380, 380], [600, 330], [520, 600], [700, 560]];
  const mag = ease(f, HACK, durationInFrames, EASE_IN_OUT);
  const hi = Math.min(3, Math.floor(mag * 4));
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      {/* shield */}
      <Abs x={540} y={480} s={pop(f, 2)}>
        <svg width={520} height={600} viewBox="0 0 520 600">
          <path d="M260 20 L490 110 V290 C490 440 380 540 260 585 C140 540 30 440 30 290 V110 Z" fill={C.oliveSoft} stroke={C.ink} strokeWidth={12} />
        </svg>
      </Abs>
      {holes.map(([x, y], i) => (
        <Abs key={i} x={x} y={y} s={pop(f, HOLES + i * 5)}>
          <div style={{ width: 70, height: 56, background: C.paper, border: `6px solid ${C.ink}`, borderRadius: "40% 60% 50% 45%", boxShadow: i === hi && f > HACK ? `0 0 0 8px ${C.orange}` : "none" }} />
        </Abs>
      ))}
      {f > NOUPD - 4 && (
        <Abs x={310} y={150} s={pop(f, NOUPD - 4)} r={-5}>
          <div style={{ position: "relative" }}><Chip text="آخر تحديث: ٢٠١٩" /><Strike t={ease(f, NOUPD + 6, NOUPD + 16)} w={280} /></div>
        </Abs>
      )}
      {/* hacker magnifier sweeping the holes */}
      <Abs x={f > HACK ? lerp(holes[Math.max(0, hi - 1)][0], holes[hi][0], (mag * 4) % 1) + 60 : 1100} y={f > HACK ? lerp(holes[Math.max(0, hi - 1)][1], holes[hi][1], (mag * 4) % 1) + 60 : 900} s={pop(f, HACK)}>
        <svg width={170} height={170} viewBox="0 0 170 170">
          <circle cx={70} cy={70} r={52} fill="rgba(241,238,229,0.25)" stroke={C.ink} strokeWidth={12} />
          <path d="M108 108 L160 160" stroke={C.ink} strokeWidth={18} strokeLinecap="round" />
        </svg>
      </Abs>
      {f > HACK && <Abs x={760} y={150} s={pop(f, HACK + 4)}><Chip text="الهكر بيعرفوها" accent /></Abs>}
    </Rig>
  );
};

/* s6 — protection: official sites only, no strange links, auto-updates on */
export const ProtectScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const OFFICIAL = cue("نزّل", 51);
  const LINKS = cue("تضغط", 123);
  const UPD = cue("وخلّي", 165);
  const rows: [string, number, React.ReactNode][] = [
    ["من الموقع الرسمي بس", OFFICIAL, <div key="a" style={{ width: 60, height: 60, borderRadius: 30, background: C.olive, border: `5px solid ${C.ink}`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: C.paper }}>✓</div>],
    ["لا تضغط روابط غريبة", LINKS, <div key="b" style={{ position: "relative", fontFamily: FONT_UI, fontWeight: 600, fontSize: 26, color: C.orange, direction: "ltr" }}>bit.ly/??<Strike t={ease(f, LINKS + 6, LINKS + 16)} w={110} /></div>],
    ["التحديث التلقائي شغّال", UPD, <div key="c" style={{ width: 100, height: 52, borderRadius: 26, background: f > UPD + 8 ? C.olive : C.grid, border: `5px solid ${C.ink}`, position: "relative" }}><div style={{ position: "absolute", top: 4, left: lerp(4, 52, ease(f, UPD + 4, UPD + 12, EASE_BACK)), width: 34, height: 34, borderRadius: 17, background: C.white, border: `4px solid ${C.ink}` }} /></div>],
  ];
  return (
    <Rig s={1} x={0} y={0}>
      <Abs x={500} y={150} s={pop(f, 4)}><BigWord text="الحماية بسيطة" size={84} accent /></Abs>
      {rows.map(([t, t0, icon], i) => {
        const o = ease(f, t0 - 4, t0 + 12, EASE_BACK);
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: 290 + i * 170, width: 780, height: 140, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", background: C.white, border: `7px solid ${C.ink}`, borderRadius: 26, boxShadow: `10px 10px 0 ${i === 2 ? C.orange : C.oliveSoft}`, direction: "rtl", opacity: Math.min(1, o * 1.5), transform: `translateX(${(1 - o) * -200}px)` }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 46, color: C.ink }}>{t}</div>
            {icon}
          </div>
        );
      })}
    </Rig>
  );
};

export { EASE_BACK };
