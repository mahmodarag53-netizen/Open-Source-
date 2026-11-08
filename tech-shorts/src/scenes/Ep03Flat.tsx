import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_BACK, EASE_IN_OUT, FONT_TITLE } from "../theme";
import type { Word } from "../Episode";
import { Rig, Stamp, ease, lerp, useCue } from "./Ep01Flat";
import { Abs, BigWord, Chip, Phone, Router, Strike, Waves, pop } from "./kit";

const cam = (f: number, d: number, a = 0.96, b = 1.06) => lerp(a, b, ease(f, 0, d, EASE_IN_OUT));

/** Top-down apartment plan. Rooms are drawn as line art; `draw` 0..1. */
const Plan: React.FC<{ draw: number; walls?: boolean }> = ({ draw, walls = true }) => (
  <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <rect x={96} y={236} width={820} height={600} rx={20} fill={C.shadow} opacity={draw} />
    <rect x={80} y={220} width={820} height={600} rx={20} fill={C.white} stroke={C.ink} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    {walls && (
      <>
        <path d="M520 220 V460 M520 560 V820" stroke={C.ink} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(draw, 0.4, 1)} />
        <path d="M520 520 H900" stroke={C.ink} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(draw, 0.5, 1)} />
      </>
    )}
    {/* furniture */}
    <g opacity={ease(draw, 0.6, 1)}>
      <rect x={130} y={620} width={260} height={110} rx={30} fill={C.oliveSoft} stroke={C.ink} strokeWidth={7} />
      <rect x={160} y={300} width={200} height={40} rx={8} fill={C.sand} stroke={C.ink} strokeWidth={6} />
      <rect x={620} y={590} width={220} height={180} rx={16} fill={C.sand} stroke={C.ink} strokeWidth={7} />
      <rect x={640} y={610} width={180} height={50} rx={10} fill={C.white} stroke={C.ink} strokeWidth={5} />
    </g>
  </svg>
);

/* s1 — living room: full signal, bedroom: nothing */
export const WifiRoomsScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const SALON = cue("بالصالون", 9);
  const BED = cue("وبغرفة", 63);
  const NONE = cue("شي", 114);
  const WHY = cue("ليش", 135);
  const toBed = ease(f, BED - 6, BED + 18, EASE_IN_OUT);
  return (
    <Rig s={cam(f, durationInFrames, 0.86, 0.92)} x={lerp(-30, 30, toBed)} y={0}>
      <Plan draw={ease(f, 0, 24, EASE_IN_OUT)} />
      <Abs x={260} y={420} s={pop(f, 6)}><Router s={0.8} /></Abs>
      <Waves cx={260} cy={400} max={360} power={ease(f, 10, 24)} />
      <Abs x={420} y={560} s={pop(f, SALON)} r={-8}><Phone bars={4} s={0.7} /></Abs>
      {f > SALON + 10 && <Abs x={300} y={150} s={pop(f, SALON + 10)}><Chip text="الصالون: طيّارة" accent /></Abs>}
      <Abs x={760} y={400} s={pop(f, BED)} r={8}>
        <div style={{ position: "relative" }}>
          <Phone bars={f > NONE ? 0 : 1} s={0.7} />
          {f > NONE && <div style={{ position: "absolute", left: 20, top: 70 }}><BigWord text="×" size={110} accent /></div>}
        </div>
      </Abs>
      {f > BED + 8 && <Abs x={760} y={170} s={pop(f, BED + 8)}><Chip text="غرفة النوم" /></Abs>}
      <Abs x={500} y={520} s={pop(f, WHY)} r={Math.sin(f / 5) * 6}><BigWord text="ليش؟" size={100} accent /></Abs>
    </Rig>
  );
};

/* s2 — wifi is waves, like sound; further away → weaker */
export const WifiWavesScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const WAVES = cue("موجات", 33);
  const SOUND = cue("الصوت", 63);
  const FAR = cue("بعدت", 114);
  const away = ease(f, FAR - 6, durationInFrames - 4, EASE_IN_OUT);
  const px = lerp(420, 880, away);
  const bars = lerp(4, 0.6, away);
  return (
    <Rig s={cam(f, durationInFrames, 1.0, 0.94)} x={lerp(0, 60, away)} y={0}>
      <Abs x={220} y={500}><Router s={0.9} /></Abs>
      <Waves cx={220} cy={470} max={720} power={ease(f, WAVES - 6, WAVES + 6)} speed={5} />
      {/* speaker comparison */}
      <Abs x={220} y={180} s={pop(f, SOUND)}>
        <svg width={220} height={120} viewBox="0 0 220 120" style={{ overflow: "visible" }}>
          <path d="M20 40 H60 L110 8 V112 L60 80 H20 Z" fill={C.white} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          {[0, 1, 2].map((k) => <path key={k} d={`M${135 + k * 26} ${30 - k * 8} Q${160 + k * 30} 60 ${135 + k * 26} ${90 + k * 8}`} stroke={C.orange} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 6 - k))} />)}
        </svg>
      </Abs>
      {f > SOUND && <Abs x={460} y={170} s={pop(f, SOUND + 6)}><Chip text="متل الصوت" /></Abs>}
      <Abs x={px} y={560} r={6}><Phone bars={bars} s={0.75} /></Abs>
      <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M300 760 H${px}`} stroke={C.orange} strokeWidth={8} strokeDasharray="16 14" opacity={ease(f, FAR - 6, FAR + 6)} strokeLinecap="round" />
      </svg>
      <Stamp text="بتضعف" x={720} y={180} t0={cue("بتضعف", 147)} size={58} />
    </Rig>
  );
};

/** Waves travelling right through walls; each wall absorbs. */
const WallWaves: React.FC<{ walls: number[]; loss: number[] }> = ({ walls, loss }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {[0, 1, 2, 3, 4].map((k) => {
        const x = 200 + ((f * 6 + k * 160) % 800);
        let p = 1;
        walls.forEach((wx, i) => { if (x > wx) p *= 1 - loss[i]; });
        return <path key={k} d={`M${x} 360 Q${x + 60} 520 ${x} 680`} stroke={C.olive} strokeWidth={14} fill="none" strokeLinecap="round" opacity={p * Math.min(1, (x - 200) / 80)} />;
      })}
    </svg>
  );
};

/* s3 — every wall eats strength; concrete & steel are the worst */
export const WifiWallsScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cue = useCue(words);
  const WALL = cue("حيط", 24);
  const CONC = cue("الإسمنت", 126);
  const STEEL = cue("والحديد", 144);
  const w1 = pop(f, WALL);
  const w2 = pop(f, CONC);
  return (
    <Rig s={cam(f, durationInFrames)} x={0} y={0}>
      <Abs x={140} y={520}><Router s={0.8} /></Abs>
      <WallWaves walls={[460, 720]} loss={[0.45 * w1, 0.85 * w2]} />
      {/* thin wall */}
      <Abs x={460} y={520} s={w1} origin="50% 100%">
        <div style={{ width: 50, height: 380, background: C.sand, border: `7px solid ${C.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${C.shadow}`, backgroundImage: `repeating-linear-gradient(0deg, transparent 0 46px, ${C.ink} 46px 52px)` }} />
      </Abs>
      {/* concrete + rebar */}
      <Abs x={720} y={520} s={w2} origin="50% 100%">
        <div style={{ position: "relative", width: 120, height: 420, background: "#5B6670", border: `8px solid ${C.ink}`, borderRadius: 10, boxShadow: `10px 10px 0 ${C.shadow}` }}>
          <svg width={104} height={404} viewBox="0 0 104 404" style={{ position: "absolute", inset: 0 }}>
            {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M0 ${30 + k * 68} H104`} stroke={C.orange} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, STEEL + k * 2, STEEL + 10 + k * 2)} />)}
            {[0, 1].map((k) => <path key={k} d={`M${30 + k * 44} 0 V404`} stroke={C.orange} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, STEEL, STEEL + 14)} />)}
          </svg>
        </div>
      </Abs>
      {f > WALL + 6 && <Abs x={460} y={250} s={pop(f, WALL + 6)}><Chip text="−٤٥٪" /></Abs>}
      {f > CONC + 8 && <Abs x={720} y={230} s={pop(f, CONC + 8)}><Chip text="−٩٠٪" accent /></Abs>}
      <Stamp text="أسوأ شي!" x={500} y={130} t0={cue("أسوأ", 174)} size={58} />
    </Rig>
  );
};

/* s4 — mirror, fish tank, microwave all scramble the signal */
export const WifiInterferenceScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const M = cue("المراية", 18);
  const T = cue("وحوض", 39);
  const W = cue("والميكروويف", 75);
  const ALL = cue("بيشوّشوا", 123);
  const zig = (x: number, t0: number) => (
    <svg width={220} height={120} viewBox="0 0 220 120" style={{ position: "absolute", left: x - 110, top: 200, opacity: ease(f, ALL - 4, ALL + 6), overflow: "visible" }}>
      <path d={`M0 60 ${Array.from({ length: 10 }).map((_, k) => `L${(k + 1) * 22} ${60 + (k % 2 ? -1 : 1) * (20 + 18 * Math.sin((f + k * 5 + t0) / 3))}`).join(" ")}`} stroke={C.orange} strokeWidth={8} fill="none" strokeLinejoin="round" />
    </svg>
  );
  return (
    <Rig s={1} x={Math.sin(f / 40) * 10} y={0}>
      <Waves cx={500} cy={520} max={600} power={0.6} />
      <Abs x={200} y={540} s={pop(f, M)}>
        <svg width={170} height={330} viewBox="0 0 170 330">
          <rect x={10} y={10} width={150} height={280} rx={70} fill="#B9D7E6" stroke={C.ink} strokeWidth={9} />
          <path d="M50 60 L110 130 M60 150 L120 210" stroke={C.white} strokeWidth={10} strokeLinecap="round" />
          <path d="M40 290 L20 325 M130 290 L150 325" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        </svg>
      </Abs>
      <Abs x={500} y={580} s={pop(f, T)}>
        <svg width={260} height={220} viewBox="0 0 260 220">
          <rect x={10} y={20} width={240} height={190} rx={14} fill="#6FB7C9" stroke={C.ink} strokeWidth={9} />
          <path d={`M14 ${60 + Math.sin(f / 6) * 6} Q130 ${45 - Math.sin(f / 6) * 6} 246 ${60 + Math.sin(f / 6) * 6}`} stroke={C.white} strokeWidth={6} fill="none" />
          <g transform={`translate(${100 + Math.sin(f / 12) * 50} 130)`}>
            <path d="M0 0 Q30 -26 60 0 Q30 26 0 0 Z M60 0 L80 -16 L80 16 Z" fill={C.orange} stroke={C.ink} strokeWidth={5} />
          </g>
          {[0, 1, 2].map((k) => <circle key={k} cx={60 + k * 60} cy={190 - ((f * 2 + k * 40) % 130)} r={7} fill="none" stroke={C.white} strokeWidth={4} />)}
        </svg>
      </Abs>
      <Abs x={800} y={570} s={pop(f, W)}>
        <svg width={260} height={190} viewBox="0 0 260 190">
          <rect x={10} y={10} width={240} height={170} rx={16} fill={C.sand} stroke={C.ink} strokeWidth={9} />
          <rect x={30} y={30} width={150} height={130} rx={10} fill={f > W && Math.floor(f / 4) % 2 ? C.orange : C.oliveSoft} stroke={C.ink} strokeWidth={7} />
          {[0, 1, 2].map((k) => <circle key={k} cx={215} cy={50 + k * 40} r={10} fill={C.ink} />)}
        </svg>
      </Abs>
      {zig(200, 0)}
      {zig(500, 20)}
      {zig(800, 40)}
      {[["مراية", 200, M], ["حوض سمك", 500, T], ["ميكروويف", 800, W]].map(([t, x, t0]) => (
        <Abs key={t as string} x={x as number} y={790} s={pop(f, (t0 as number) + 6)}><Chip text={t as string} size={38} /></Abs>
      ))}
    </Rig>
  );
};

/** House cross-section with 4 rooms; router position animates. */
const House: React.FC = () => (
  <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <path d="M120 360 L500 150 L880 360" fill="none" stroke={C.ink} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
    <rect x={150} y={360} width={700} height={480} fill={C.white} stroke={C.ink} strokeWidth={10} />
    <path d="M500 360 V840 M150 600 H850" stroke={C.ink} strokeWidth={9} />
    <path d="M100 840 H900" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
  </svg>
);

/* s5 — not a pricier router: put it in the middle, up high, in the open */
export const WifiPlaceScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const PRICE = cue("أغلى", 57);
  const MID = cue("بنص", 111);
  const HIGH = cue("عالي", 162);
  const OPEN = cue("ومكشوف", 180);
  const toMid = ease(f, MID - 4, MID + 16, EASE_IN_OUT);
  const up = ease(f, HIGH - 4, HIGH + 14, EASE_BACK);
  const rx = lerp(240, 500, toMid);
  const ry = lerp(780, lerp(780, 540, up), 1);
  const cover = lerp(220, 520, ease(f, MID, OPEN + 10, EASE_IN_OUT));
  return (
    <Rig s={0.95} x={0} y={0}>
      <House />
      {/* TV that hides the router at first */}
      <Abs x={260} y={720} o={1 - ease(f, MID - 4, MID + 6)}><div style={{ width: 200, height: 120, background: C.ink, borderRadius: 10, border: `6px solid ${C.ink}` }} /></Abs>
      <Waves cx={rx} cy={ry - 10} max={cover} power={0.9} />
      <Abs x={rx} y={ry} s={0.6}><Router /></Abs>
      {f > HIGH && <Abs x={rx} y={ry + 60} s={pop(f, HIGH)}><div style={{ width: 160, height: 18, background: C.sand, border: `6px solid ${C.ink}`, borderRadius: 6 }} /></Abs>}
      {f > PRICE - 10 && f < MID && (
        <Abs x={760} y={200} s={pop(f, PRICE - 10)} r={6}>
          <div style={{ position: "relative" }}><Chip text="راوتر أغلى" /><Strike t={ease(f, PRICE, PRICE + 10)} w={250} /></div>
        </Abs>
      )}
      {[["بنص البيت", MID], ["مكان عالي", HIGH], ["مكشوف", OPEN]].map(([t, t0], i) => (
        <Abs key={i} x={240 + i * 260} y={90} s={pop(f, (t0 as number) + 4)}><Chip text={`✓ ${t}`} accent={i === 2} size={36} /></Abs>
      ))}
    </Rig>
  );
};

/* s6 — big house: extender or mesh system */
export const WifiMeshScene: React.FC<{ words: Word[] }> = ({ words }) => {
  const f = useCurrentFrame();
  const cue = useCue(words);
  const BIG = cue("كبير", 27);
  const EXT = cue("مقوّي", 51);
  const MESH = cue("ميش", 102);
  const RELAX = cue("وارتاح", 117);
  const nodes: [number, number, number][] = [[260, 500, 0], [740, 480, EXT], [500, 720, MESH]];
  return (
    <Rig s={lerp(1.05, 0.9, ease(f, BIG - 6, BIG + 14, EASE_IN_OUT))} x={0} y={0}>
      <House />
      <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M260 500 L740 480 L500 720 Z" fill="none" stroke={C.orange} strokeWidth={7} strokeDasharray="14 12" strokeDashoffset={-f * 2} opacity={ease(f, MESH, MESH + 10)} />
      </svg>
      {nodes.map(([x, y, t0], i) => (
        <React.Fragment key={i}>
          <Waves cx={x} cy={y - 10} max={300} power={pop(f, t0) * 0.85} />
          <Abs x={x} y={y} s={0.55 * pop(f, t0)}><Router /></Abs>
        </React.Fragment>
      ))}
      {f > EXT && <Abs x={740} y={260} s={pop(f, EXT + 4)}><Chip text="مقوّي إشارة" /></Abs>}
      {f > MESH && <Abs x={500} y={815} s={pop(f, MESH + 4)}><Chip text="نظام Mesh" accent /></Abs>}
      <Abs x={500} y={120} s={pop(f, RELAX)}><BigWord text="✓ وارتاح" size={90} accent /></Abs>
      <div style={{ position: "absolute", left: 0, top: 0, fontFamily: FONT_TITLE, opacity: 0 }}>.</div>
    </Rig>
  );
};

export { EASE_BACK };
