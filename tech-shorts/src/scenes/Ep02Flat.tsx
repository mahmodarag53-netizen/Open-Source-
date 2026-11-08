import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, FONT_TITLE, FONT_UI } from "../theme";
import type { Word } from "../Episode";
import { Rig, Stamp, ease, lerp, useCue } from "./Ep01Flat";
import { Abs, BigWord, Chip, Laptop, Monitor, Progress, Stopwatch, Strike, pop } from "./kit";

const cam = (f: number, d: number, a = 0.96, b = 1.06) => lerp(a, b, ease(f, 0, d, EASE_IN_OUT));

/** SSD stick drawing. glow 0..1 lights the chips. */
const SSD: React.FC<{ w?: number; glow?: number; trails?: number }> = ({ w = 420, glow = 0, trails = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: w, height: w * 0.32 }}>
      {trails > 0 &&
        [0, 1, 2, 3].map((k) => (
          <div key={k} style={{ position: "absolute", right: w * 0.96, top: w * (0.05 + k * 0.07), height: 10, width: (120 + ((f * 25 + k * 70) % 160)) * trails, borderRadius: 5, background: k % 2 ? C.orange : C.olive, opacity: 0.85 }} />
        ))}
      <svg width={w} height={w * 0.32} viewBox="0 0 420 135" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={10} y={12} width={410} height={120} rx={10} fill={C.shadow} />
        <rect x={0} y={0} width={410} height={120} rx={10} fill={C.oliveSoft} stroke={C.ink} strokeWidth={8} />
        <rect x={366} y={20} width={44} height={80} fill={C.sand} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={28 + k * 108} y={26} width={86} height={68} rx={6} fill={glow > 0 && (Math.floor(f / 3) + k) % 3 === 0 ? C.orange : C.ink} stroke={C.ink} strokeWidth={4} />
        ))}
      </svg>
    </div>
  );
};

/** Hard drive with spinning platter and swinging arm (target angle in deg). */
const HDD: React.FC<{ s?: number; spin?: number; arm?: number; blocks?: boolean; hi?: number }> = ({ s = 1, spin = 1, arm = -30, blocks, hi = -1 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={460 * s} height={560 * s} viewBox="0 0 460 560" style={{ overflow: "visible" }}>
      <rect x={18} y={18} width={440} height={540} rx={30} fill={C.shadow} />
      <rect x={0} y={0} width={440} height={540} rx={30} fill={C.sand} stroke={C.ink} strokeWidth={10} />
      <g transform={`rotate(${f * 14 * spin} 220 220)`}>
        <circle cx={220} cy={220} r={180} fill={C.white} stroke={C.ink} strokeWidth={9} />
        <circle cx={220} cy={220} r={140} fill="none" stroke={C.grid} strokeWidth={4} />
        <circle cx={220} cy={220} r={100} fill="none" stroke={C.grid} strokeWidth={4} />
        <path d="M220 40 A180 180 0 0 1 380 140" stroke={C.inkSoft} strokeWidth={6} fill="none" />
        {blocks &&
          Array.from({ length: 7 }).map((_, k) => {
            const a = (k / 7) * Math.PI * 2;
            const rr = 120 + (k % 3) * 22;
            return <rect key={k} x={220 + Math.cos(a) * rr - 13} y={220 + Math.sin(a) * rr - 13} width={26} height={26} rx={4} fill={k === hi ? C.orange : C.olive} stroke={C.ink} strokeWidth={4} />;
          })}
      </g>
      <circle cx={220} cy={220} r={28} fill={C.ink} />
      <g transform={`rotate(${arm} 390 470)`}>
        <path d="M390 470 L250 250" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
        <path d="M390 470 L250 250" stroke={C.orange} strokeWidth={10} strokeLinecap="round" />
        <circle cx={250} cy={250} r={14} fill={C.orange} stroke={C.ink} strokeWidth={5} />
      </g>
      <circle cx={390} cy={470} r={34} fill={C.white} stroke={C.ink} strokeWidth={9} />
    </svg>
  );
};

/* s1 — installed an SSD: boot in 10s instead of 2 minutes */
export const SsdBootScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const IN = cue("ركّبت", 9);
  const BOOT = cue("يقلع", 78);
  const TEN = cue("بعشر", 87);
  const TWO = cue("دقيقتين", 123);
  const WHY = cue("ليش", 159);
  const slide = ease(f, IN, IN + 22, EASE_BACK);
  const boot = ease(f, BOOT, TEN + 10, EASE_IN_OUT);
  return (
    <Rig s={cam(f, durationInFrames)} x={Math.sin(f / 50) * 10} y={0}>
      <Abs x={430} y={420}>
        <Monitor w={520}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 24 }}>
            <div style={{ width: 90, height: 90, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, opacity: ease(f, BOOT, BOOT + 8), transform: `scale(${ease(f, BOOT, BOOT + 12, EASE_BACK)})` }}>
              {[0, 1, 2, 3].map((k) => <div key={k} style={{ background: k === 0 ? C.orange : C.paper, borderRadius: 4 }} />)}
            </div>
            <Progress v={boot} w={300} color={C.orange} />
          </div>
        </Monitor>
      </Abs>
      <Abs x={lerp(1300, 760, slide)} y={720} r={lerp(30, -8, slide)}>
        <SSD w={300} trails={slide > 0.9 ? 1 : 0} />
      </Abs>
      <Abs x={830} y={230} s={pop(f, TEN)}>
        <Stopwatch t={ease(f, TEN, TEN + 20) * 0.17} label="١٠ ثواني" s={0.8} />
      </Abs>
      {f > TWO && (
        <Abs x={270} y={190} s={pop(f, TWO)} r={-6}>
          <div style={{ position: "relative" }}>
            <Chip text="دقيقتين" />
            <Strike t={ease(f, TWO + 8, TWO + 18)} w={220} />
          </div>
        </Abs>
      )}
      <Abs x={500} y={130} s={pop(f, WHY)} r={Math.sin(f / 5) * 6}>
        <BigWord text="؟" size={150} accent />
      </Abs>
    </Rig>
  );
};

/* s2 — inside the HDD: spinning platter + needle, like an old record */
export const HddInsideScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const PLATE = cue("صحن", 63);
  const NEEDLE = cue("وإبرة", 93);
  const RECORD = cue("إسطوانة", 174);
  const spin = ease(f, PLATE, PLATE + 12);
  const arm = lerp(-55, -10, ease(f, NEEDLE, NEEDLE + 18, EASE_BACK));
  const rec = pop(f, RECORD - 6);
  return (
    <Rig s={cam(f, durationInFrames, 0.92, 1.02)} x={lerp(0, 90, ease(f, RECORD - 10, RECORD + 10, EASE_IN_OUT))} y={0}>
      <Abs x={420} y={500} s={ease(f, 0, 16, EASE_BACK)}>
        <HDD s={1.05} spin={0.15 + spin} arm={arm} />
      </Abs>
      {f > PLATE && <Abs x={330} y={130} s={pop(f, PLATE)}><Chip text="صحن عم يلفّ" /></Abs>}
      {f > NEEDLE && <Abs x={780} y={860} s={pop(f, NEEDLE + 6)}><Chip text="إبرة" accent /></Abs>}
      {/* vinyl record comparison */}
      <Abs x={880} y={330} s={rec} r={f * 10}>
        <svg width={230} height={230} viewBox="0 0 230 230">
          <circle cx={115} cy={115} r={108} fill={C.ink} stroke={C.ink} strokeWidth={6} />
          {[90, 70, 50].map((r) => <circle key={r} cx={115} cy={115} r={r} fill="none" stroke={C.inkSoft} strokeWidth={3} />)}
          <circle cx={115} cy={115} r={30} fill={C.orange} />
        </svg>
      </Abs>
    </Rig>
  );
};

/* s3 — every file means moving the needle there: that takes time */
export const HddSeekScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const FILE = cue("ملف", 15);
  const MOVE = cue("تتحرّك", 75);
  const TIME = cue("بتاخد", 141);
  // needle hops between targets slowly
  const targets = [-10, -38, 6, -30];
  const seg = Math.min(3, Math.floor(Math.max(0, f - MOVE) / 22));
  const local = ease(f, MOVE + seg * 22, MOVE + seg * 22 + 18, EASE_IN_OUT);
  const arm = f < MOVE ? -10 : lerp(targets[seg], targets[Math.min(3, seg + 1)], local);
  return (
    <Rig s={cam(f, durationInFrames, 1.0, 1.12)} x={0} y={0}>
      <Abs x={500} y={480}>
        <HDD s={1.1} spin={0.6} arm={arm} blocks hi={f > FILE ? (seg + 2) % 7 : -1} />
      </Abs>
      {f > FILE && <Abs x={300} y={130} s={pop(f, FILE)}><Chip text="الملف هون" accent /></Abs>}
      <Abs x={850} y={300} s={pop(f, TIME)}>
        <Stopwatch t={(f - TIME) / 50} s={0.7} />
      </Abs>
      <Stamp text="بتاخد وقت" x={500} y={150} t0={TIME + 6} size={56} rot={-4} />
    </Rig>
  );
};

/* s4 — SSD: no moving parts, memory chips like a flash drive, much faster */
export const SsdChipsScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const NOPARTS = cue("قطعة", 69);
  const CHIPS = cue("شرايح", 105);
  const FLASH = cue("الفلاشة", 147);
  const FAST = cue("أسرع", 180);
  const gear = pop(f, NOPARTS - 6);
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={520} y={480} s={1.6 * ease(f, 0, 18, EASE_BACK)} r={-6}>
        <SSD w={420} glow={f > CHIPS ? 1 : 0} trails={ease(f, FAST, FAST + 12)} />
      </Abs>
      {/* crossed-out gear = no moving parts */}
      <Abs x={210} y={180} s={gear} r={f > NOPARTS + 14 ? 0 : f * 6}>
        <div style={{ position: "relative", width: 150, height: 150 }}>
          <svg width={150} height={150} viewBox="0 0 150 150">
            {Array.from({ length: 8 }).map((_, k) => <rect key={k} x={67} y={8} width={16} height={30} rx={4} fill={C.ink} transform={`rotate(${k * 45} 75 75)`} />)}
            <circle cx={75} cy={75} r={44} fill={C.sand} stroke={C.ink} strokeWidth={8} />
            <circle cx={75} cy={75} r={16} fill={C.ink} />
          </svg>
          <Strike t={ease(f, NOPARTS + 8, NOPARTS + 18)} w={150} />
        </div>
      </Abs>
      {f > CHIPS && <Abs x={520} y={720} s={pop(f, CHIPS)}><Chip text="شرايح ذاكرة" accent /></Abs>}
      {/* flash drive morph */}
      <Abs x={830} y={200} s={pop(f, FLASH)} r={12}>
        <svg width={120} height={210} viewBox="0 0 120 210">
          <rect x={30} y={4} width={60} height={56} fill={C.white} stroke={C.ink} strokeWidth={7} />
          <rect x={10} y={56} width={100} height={150} rx={18} fill={C.olive} stroke={C.ink} strokeWidth={8} />
        </svg>
      </Abs>
      <Stamp text="أسرع بكتير!" x={520} y={760} t0={FAST + 4} size={60} />
    </Rig>
  );
};

/* s5 — race: HDD searches, SSD knows instantly */
export const SsdRaceScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const H = cue("الهارد", 18);
  const S = cue("والإس", 75);
  const NOW = cue("فوراً", 141);
  const hddX = lerp(160, 520, ease(f, H, H + 140, EASE_IN_OUT)) + Math.sin(f / 3) * 6;
  const ssdX = lerp(160, 840, ease(f, NOW - 4, NOW + 4, EASE_IN_OUT));
  const lane = (y: number, label: string, x: number, accent: boolean, show: number) => (
    <>
      <div style={{ position: "absolute", left: 90, top: y, width: 830, height: 150, borderRadius: 30, border: `6px solid ${C.ink}`, background: C.white, opacity: show, boxShadow: `9px 9px 0 ${accent ? C.orange : C.oliveSoft}` }} />
      <div style={{ position: "absolute", left: 870, top: y + 20, width: 12, height: 110, background: `repeating-linear-gradient(${C.ink} 0 14px, ${C.paper} 14px 28px)`, opacity: show }} />
      <Abs x={x} y={y + 75} s={show}>
        <div style={{ width: 90, height: 110, background: C.paper, border: `6px solid ${C.ink}`, borderRadius: 10, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_UI, fontWeight: 600, fontSize: 26, color: C.ink }}>ملف</div>
      </Abs>
      <Abs x={170} y={y - 30} s={show}><Chip text={label} accent={accent} size={36} /></Abs>
    </>
  );
  return (
    <Rig s={1} x={0} y={0}>
      {lane(270, "هارد", hddX, false, pop(f, H - 6))}
      {lane(560, "SSD", ssdX, true, pop(f, S - 6))}
      {f > H + 10 && f < NOW + 20 && <Abs x={hddX + 80} y={300} s={0.7} r={f * 8}><BigWord text="⟳" size={80} /></Abs>}
      <Stamp text="فوراً!" x={700} y={140} t0={NOW + 4} size={64} />
    </Rig>
  );
};

/* s6 — tip: don't replace the old laptop; add an SSD + fresh Windows */
export const SsdTipScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const OLD = cue("قديم", 63);
  const NO = cue("تغيّرو", 87);
  const ADD = cue("ركّبلو", 108);
  const WIN = cue("الويندوز", 177);
  const SEE = cue("وشوف", 207);
  const install = ease(f, WIN, WIN + 24, EASE_IN_OUT);
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={500} y={480} s={ease(f, 0, 16, EASE_BACK)}>
        <Laptop w={460} screen={f > SEE ? C.olive : C.oliveSoft}>
          {f > OLD && f < ADD && <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 80, color: C.paper, transform: `translateY(${-Math.abs(Math.sin(f / 8)) * 14}px)` }}>z z</div>}
          {f > WIN && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 20 }}>
              <div style={{ width: 80, height: 80, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, transform: `scale(${pop(f, WIN)})` }}>{[0, 1, 2, 3].map((k) => <div key={k} style={{ background: C.paper, borderRadius: 3 }} />)}</div>
              <div style={{ transform: "scale(0.6)" }}><Progress v={install} w={340} color={C.orange} /></div>
            </div>
          )}
        </Laptop>
      </Abs>
      {/* "don't replace": a new-laptop price card gets crossed out */}
      {f > NO - 4 && (
        <Abs x={290} y={170} s={pop(f, NO - 4)} r={-5}>
          <div style={{ position: "relative" }}>
            <Chip text="جهاز جديد" />
            <Strike t={ease(f, NO + 6, NO + 16)} w={250} />
          </div>
        </Abs>
      )}
      <Abs x={lerp(1250, 700, ease(f, ADD, ADD + 18, EASE_BACK))} y={720} r={-8}>
        <SSD w={240} />
      </Abs>
      {f > SEE && [0, 1, 2, 3, 4].map((k) => <Abs key={k} x={300 + k * 100} y={210 - Math.abs(Math.sin((f + k * 7) / 6)) * 30} s={pop(f, SEE + k * 2)}><BigWord text="✦" size={56} accent /></Abs>)}
    </Rig>
  );
};

export { EASE_BACK };
