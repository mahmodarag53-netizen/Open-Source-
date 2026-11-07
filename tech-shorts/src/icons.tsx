import React from "react";
import { C } from "./theme";

/**
 * Line-art icon library, 400×400 viewBox. Every stroke draws on with `d` (0→1),
 * fills fade in during the second half, `f` drives idle loops, `state` drives variants.
 */
export type IconProps = { d: number; f: number; state?: string };

const SW = 8;
const fillIn = (d: number) => Math.max(0, Math.min(1, (d - 0.45) / 0.45));

type Shape = React.SVGProps<SVGPathElement> & { el?: "path" | "rect" | "circle" | "line" | "polyline" | "ellipse" };
const S: React.FC<Shape & { d0: number; fillC?: string }> = ({ el = "path", d0, fillC, ...rest }) => {
  const Tag = el as unknown as React.ElementType;
  return (
    <Tag
      {...rest}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - d0}
      stroke={rest.stroke ?? C.ink}
      strokeWidth={rest.strokeWidth ?? SW}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={fillC ?? "none"}
      fillOpacity={fillC ? fillIn(d0) : undefined}
    />
  );
};
// staggered draw helper: piece i of n
const st = (d: number, i: number, n: number) => {
  const span = 1 / (1 + (n - 1) * 0.45);
  return Math.max(0, Math.min(1, (d - i * span * 0.45) / span));
};

const Laptop: React.FC<IconProps> = ({ d, f, state }) => {
  const spin = (f * 8) % 360;
  const hot = state === "hot";
  return (
    <g>
      <S el="rect" x={70} y={90} width={260} height={175} rx={14} d0={st(d, 0, 3)} fillC={C.white} />
      <S el="rect" x={92} y={110} width={216} height={135} rx={6} d0={st(d, 1, 3)} fillC={hot ? C.orangeSoft : C.blueSoft} />
      <S d="M40 290 L360 290 L335 320 L65 320 Z" d0={st(d, 2, 3)} fillC={C.sand} />
      {state === "lag" && d > 0.7 && (
        <g transform={`rotate(${spin} 200 178)`} opacity={fillIn(d)}>
          <circle cx={200} cy={178} r={34} stroke={C.ink} strokeWidth={9} fill="none" strokeDasharray="150 80" strokeLinecap="round" />
        </g>
      )}
      {hot && d > 0.7 &&
        [0, 1, 2].map((i) => (
          <path key={i} d={`M${150 + i * 50} 70 q-14 -20 0 -40 q14 -20 0 -40`} stroke={C.orange} strokeWidth={7} fill="none" strokeLinecap="round"
            opacity={0.4 + 0.6 * Math.abs(Math.sin((f + i * 10) / 9))} transform={`translate(0 ${-((f + i * 8) % 20)})`} />
        ))}
    </g>
  );
};

const Desk: React.FC<IconProps> = ({ d }) => (
  <g>
    <S d="M40 200 L360 200" d0={st(d, 0, 3)} strokeWidth={12} />
    <S d="M70 200 L70 340 M330 200 L330 340" d0={st(d, 1, 3)} />
    <S d="M70 260 L330 260" d0={st(d, 2, 3)} stroke={C.inkSoft} />
  </g>
);

const Cabinet: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={100} y={50} width={200} height={300} rx={10} d0={st(d, 0, 3)} fillC={C.oliveSoft} />
    <S d="M100 150 L300 150 M100 250 L300 250" d0={st(d, 1, 3)} />
    <S d="M180 100 L220 100 M180 200 L220 200 M180 300 L220 300" d0={st(d, 2, 3)} strokeWidth={10} />
  </g>
);

const Ssd: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={60} y={130} width={280} height={140} rx={12} d0={st(d, 0, 3)} fillC={C.blueSoft} />
    {[0, 1, 2].map((i) => (
      <S key={i} el="rect" x={90 + i * 80} y={160} width={60} height={60} rx={6} d0={st(d, 1, 3)} fillC={C.ink} />
    ))}
    <S d="M90 245 L310 245" d0={st(d, 2, 3)} stroke={C.orange} />
  </g>
);

const Hdd: React.FC<IconProps> = ({ d, f, state }) => {
  const arm = state === "seek" ? Math.sin(f / 7) * 22 : Math.sin(f / 20) * 6;
  return (
    <g>
      <S el="rect" x={80} y={60} width={240} height={290} rx={16} d0={st(d, 0, 3)} fillC={C.sand} />
      <g transform={`rotate(${f * 12} 190 180)`}>
        <S el="circle" cx={190} cy={180} r={90} d0={st(d, 1, 3)} fillC={C.white} />
        <path d="M190 100 A80 80 0 0 1 270 180" stroke={C.inkSoft} strokeWidth={4} fill="none" opacity={fillIn(d)} />
      </g>
      <S el="circle" cx={190} cy={180} r={14} d0={st(d, 1, 3)} fillC={C.ink} />
      <g transform={`rotate(${arm} 290 310)`}>
        <S d="M290 310 L220 220" d0={st(d, 2, 3)} stroke={C.orange} strokeWidth={12} />
      </g>
    </g>
  );
};

const Router: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S el="rect" x={80} y={230} width={240} height={80} rx={14} d0={st(d, 0, 3)} fillC={C.white} />
    <S d="M120 230 L100 150 M280 230 L300 150" d0={st(d, 1, 3)} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={130 + i * 35} cy={270} r={8} fill={i === 0 ? C.olive : C.inkSoft} opacity={fillIn(d) * (0.5 + 0.5 * Math.sin(f / 4 + i))} />
    ))}
    {d > 0.6 &&
      [0, 1, 2].map((i) => {
        const r = 40 + ((f * 2 + i * 40) % 120);
        return <path key={i} d={`M${200 - r} ${150 - r * 0.2} A${r} ${r} 0 0 1 ${200 + r} ${150 - r * 0.2}`} stroke={C.blue} strokeWidth={7} fill="none" strokeLinecap="round" opacity={(1 - r / 160) * fillIn(d)} />;
      })}
  </g>
);

const Wifi: React.FC<IconProps> = ({ d, f }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const r = 60 + i * 60;
      const pulse = 0.55 + 0.45 * Math.sin(f / 6 - i);
      return <S key={i} d={`M${200 - r * 0.85} ${290 - r * 0.6} A${r} ${r} 0 0 1 ${200 + r * 0.85} ${290 - r * 0.6}`} d0={st(d, i, 3)} stroke={C.blue} strokeWidth={14} opacity={pulse} />;
    })}
    <S el="circle" cx={200} cy={300} r={18} d0={d} fillC={C.blue} stroke={C.blue} />
  </g>
);

const Wall: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={110} y={50} width={180} height={300} d0={st(d, 0, 2)} fillC={C.sand} />
    <S d="M110 110 H290 M110 170 H290 M110 230 H290 M110 290 H290 M170 50 V110 M230 110 V170 M170 170 V230 M230 230 V290 M170 290 V350" d0={st(d, 1, 2)} strokeWidth={6} />
  </g>
);

const Phone: React.FC<IconProps> = ({ d, f, state }) => (
  <g>
    <S el="rect" x={120} y={40} width={160} height={320} rx={28} d0={st(d, 0, 3)} fillC={C.white} />
    <S el="rect" x={138} y={80} width={124} height={240} rx={8} d0={st(d, 1, 3)} fillC={state === "hot" ? C.orangeSoft : C.blueSoft} />
    <S d="M180 60 L220 60" d0={st(d, 2, 3)} />
    {state === "lag" && d > 0.7 && (
      <g transform={`rotate(${(f * 8) % 360} 200 200)`}>
        <circle cx={200} cy={200} r={28} stroke={C.ink} strokeWidth={8} fill="none" strokeDasharray="120 60" strokeLinecap="round" />
      </g>
    )}
    {state === "hot" && d > 0.7 &&
      [0, 1].map((i) => (
        <path key={i} d={`M${175 + i * 50} 30 q-12 -18 0 -36 q12 -18 0 -36`} stroke={C.orange} strokeWidth={7} fill="none" strokeLinecap="round" transform={`translate(0 ${-((f + i * 10) % 20)})`} />
      ))}
  </g>
);

const Battery: React.FC<IconProps> = ({ d, f, state }) => {
  const lvl = state === "low" ? 0.18 : state === "hot" ? 0.6 : 0.35 + 0.5 * ((Math.sin(f / 18) + 1) / 2);
  const col = state === "low" ? C.orange : state === "hot" ? C.orange : C.olive;
  return (
    <g>
      <S el="rect" x={90} y={130} width={210} height={140} rx={18} d0={st(d, 0, 2)} fillC={C.white} />
      <S el="rect" x={300} y={175} width={22} height={50} rx={5} d0={st(d, 1, 2)} fillC={C.ink} />
      <rect x={106} y={146} width={178 * lvl * fillIn(d)} height={108} rx={8} fill={col} />
    </g>
  );
};

const Plug: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={130} y={130} width={140} height={120} rx={20} d0={st(d, 0, 3)} fillC={C.sand} />
    <S d="M165 130 V70 M235 130 V70" d0={st(d, 1, 3)} strokeWidth={14} />
    <S d="M200 250 V340" d0={st(d, 2, 3)} strokeWidth={14} />
    <S d="M210 160 L185 195 L215 195 L190 230" d0={st(d, 2, 3)} stroke={C.orange} />
  </g>
);

const Lock: React.FC<IconProps> = ({ d, state }) => {
  const open = state === "open";
  return (
    <g>
      <S d={open ? "M140 180 V120 A60 60 0 0 1 260 120 V110" : "M140 180 V130 A60 60 0 0 1 260 130 V180"} d0={st(d, 0, 2)} strokeWidth={16} />
      <S el="rect" x={110} y={180} width={180} height={160} rx={18} d0={st(d, 1, 2)} fillC={open ? C.orangeSoft : C.oliveSoft} />
      <S el="circle" cx={200} cy={250} r={18} d0={st(d, 1, 2)} fillC={C.ink} />
      <S d="M200 262 V300" d0={st(d, 1, 2)} strokeWidth={10} />
    </g>
  );
};

const Key: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="circle" cx={120} cy={200} r={60} d0={st(d, 0, 2)} fillC={C.orangeSoft} />
    <S el="circle" cx={120} cy={200} r={20} d0={st(d, 0, 2)} fillC={C.paper} />
    <S d="M180 200 H340 M300 200 V245 M260 200 V235" d0={st(d, 1, 2)} strokeWidth={14} />
  </g>
);

const Bug: React.FC<IconProps> = ({ d, f }) => {
  const w = Math.sin(f / 3) * 6;
  return (
    <g>
      <S el="ellipse" cx={200} cy={220} rx={80} ry={105} d0={st(d, 0, 3)} fillC={C.orange} />
      <S el="circle" cx={200} cy={105} r={42} d0={st(d, 1, 3)} fillC={C.ink} />
      <S d={`M120 180 L60 ${150 + w} M120 230 L50 ${230 - w} M125 280 L70 ${320 + w} M280 180 L340 ${150 - w} M280 230 L350 ${230 + w} M275 280 L330 ${320 - w} M185 70 L160 30 M215 70 L240 30`} d0={st(d, 2, 3)} />
      <S d="M200 130 V320" d0={st(d, 2, 3)} strokeWidth={5} />
    </g>
  );
};

const Shield: React.FC<IconProps> = ({ d }) => (
  <g>
    <S d="M200 40 L320 90 V190 C320 270 260 330 200 360 C140 330 80 270 80 190 V90 Z" d0={st(d, 0, 2)} fillC={C.oliveSoft} />
    <S d="M145 200 L185 240 L260 160" d0={st(d, 1, 2)} strokeWidth={16} stroke={C.ink} />
  </g>
);

const Chip: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S el="rect" x={110} y={110} width={180} height={180} rx={14} d0={st(d, 0, 3)} fillC={C.ink} />
    <S el="rect" x={150} y={150} width={100} height={100} rx={8} d0={st(d, 1, 3)} fillC={C.orange} stroke={C.white} />
    <S d="M150 110 V70 M200 110 V70 M250 110 V70 M150 290 V330 M200 290 V330 M250 290 V330 M110 150 H70 M110 200 H70 M110 250 H70 M290 150 H330 M290 200 H330 M290 250 H330" d0={st(d, 2, 3)} />
    <rect x={150} y={150} width={100} height={100} rx={8} fill={C.white} opacity={0.25 * fillIn(d) * (0.5 + 0.5 * Math.sin(f / 5))} />
  </g>
);

const Cloud: React.FC<IconProps> = ({ d, f, state }) => (
  <g transform={`translate(0 ${Math.sin(f / 15) * 6})`}>
    <S d="M110 280 A60 60 0 0 1 120 160 A80 80 0 0 1 270 140 A70 70 0 0 1 300 280 Z" d0={st(d, 0, 2)} fillC={C.white} />
    {state === "sync" && <S d="M170 220 A35 35 0 0 1 235 205 M235 205 L240 185 M235 205 L215 205" d0={st(d, 1, 2)} stroke={C.olive} />}
  </g>
);

const Server: React.FC<IconProps> = ({ d, f }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <S el="rect" x={90} y={60 + i * 100} width={220} height={80} rx={10} d0={st(d, i, 3)} fillC={C.sand} />
        <circle cx={130} cy={100 + i * 100} r={9} fill={(Math.floor(f / 6) + i) % 2 ? C.olive : C.oliveSoft} opacity={fillIn(d)} />
        <S d={`M180 ${100 + i * 100} H280`} d0={st(d, i, 3)} strokeWidth={6} />
      </g>
    ))}
  </g>
);

const Globe: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S el="circle" cx={200} cy={200} r={140} d0={st(d, 0, 3)} fillC={C.blueSoft} />
    <S el="ellipse" cx={200} cy={200} rx={60 + 15 * Math.sin(f / 20)} ry={140} d0={st(d, 1, 3)} />
    <S d="M60 200 H340 M85 130 H315 M85 270 H315" d0={st(d, 2, 3)} strokeWidth={6} />
  </g>
);

const Eye: React.FC<IconProps> = ({ d, f }) => {
  const look = Math.sin(f / 18) * 25;
  const blink = f % 90 > 84 ? 0.15 : 1;
  return (
    <g>
      <g transform={`translate(200 200) scale(1 ${blink}) translate(-200 -200)`}>
        <S d="M40 200 Q200 40 360 200 Q200 360 40 200 Z" d0={st(d, 0, 2)} fillC={C.white} />
        <S el="circle" cx={200 + look} cy={200} r={60} d0={st(d, 1, 2)} fillC={C.blue} />
        <circle cx={200 + look} cy={200} r={26} fill={C.ink} opacity={fillIn(d)} />
      </g>
    </g>
  );
};

const Ad: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={60} y={90} width={280} height={220} rx={16} d0={st(d, 0, 3)} fillC={C.white} />
    <S el="rect" x={90} y={120} width={110} height={110} rx={10} d0={st(d, 1, 3)} fillC={C.orangeSoft} />
    <S d="M225 135 H310 M225 170 H290 M225 205 H300" d0={st(d, 2, 3)} strokeWidth={7} />
    <S el="rect" x={90} y={250} width={130} height={36} rx={18} d0={st(d, 2, 3)} fillC={C.orange} />
  </g>
);

const Mail: React.FC<IconProps> = ({ d, f }) => (
  <g transform={`translate(0 ${Math.sin(f / 10) * 6})`}>
    <S el="rect" x={60} y={110} width={280} height={190} rx={14} d0={st(d, 0, 2)} fillC={C.white} />
    <S d="M60 120 L200 220 L340 120" d0={st(d, 1, 2)} />
    <S el="circle" cx={330} cy={115} r={26} d0={st(d, 1, 2)} fillC={C.orange} />
  </g>
);

const Usb: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={140} y={140} width={120} height={200} rx={16} d0={st(d, 0, 2)} fillC={C.blueSoft} />
    <S el="rect" x={160} y={60} width={80} height={80} rx={4} d0={st(d, 1, 2)} fillC={C.white} />
    <S d="M180 90 H195 M205 90 H220" d0={st(d, 1, 2)} strokeWidth={10} />
  </g>
);

const Update: React.FC<IconProps> = ({ d, f }) => (
  <g transform={`rotate(${f * 3} 200 200)`}>
    <S d="M300 200 A100 100 0 1 1 260 120" d0={st(d, 0, 2)} strokeWidth={18} stroke={C.olive} />
    <S d="M265 70 L265 125 L210 125" d0={st(d, 1, 2)} strokeWidth={18} stroke={C.olive} />
  </g>
);

const File: React.FC<IconProps> = ({ d, f, state }) => {
  const split = state === "split" ? Math.min(1, Math.max(0, (d - 0.6) * 3)) : 0;
  return (
    <g>
      {state === "split" ? (
        [0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${(i % 2 ? 1 : -1) * 40 * split + Math.sin(f / 8 + i) * 4 * split} ${(i < 2 ? -1 : 1) * 40 * split})`}>
            <S el="rect" x={110 + (i % 2) * 90} y={70 + Math.floor(i / 2) * 130} width={90} height={130} d0={d} fillC={C.white} />
          </g>
        ))
      ) : (
        <>
          <S d="M110 50 H250 L310 110 V350 H110 Z" d0={st(d, 0, 2)} fillC={C.white} />
          <S d="M250 50 V110 H310 M150 170 H270 M150 220 H270 M150 270 H230" d0={st(d, 1, 2)} strokeWidth={7} />
        </>
      )}
    </g>
  );
};

const Zip: React.FC<IconProps> = ({ d, f }) => {
  const sq = 1 - 0.12 * ((Math.sin(f / 10) + 1) / 2);
  return (
    <g transform={`translate(200 200) scale(1 ${sq}) translate(-200 -200)`}>
      <S d="M100 60 H300 V340 H100 Z" d0={st(d, 0, 2)} fillC={C.sand} />
      <S d="M200 60 V250 M185 80 H215 M185 120 H215 M185 160 H215 M185 200 H215" d0={st(d, 1, 2)} strokeWidth={7} />
      <S el="rect" x={175} y={240} width={50} height={60} rx={8} d0={st(d, 1, 2)} fillC={C.orange} />
    </g>
  );
};

const Trash: React.FC<IconProps> = ({ d }) => (
  <g>
    <S d="M90 110 H310 M160 110 V75 H240 V110" d0={st(d, 0, 2)} />
    <S d="M115 110 L135 350 H265 L285 110 M170 160 V300 M230 160 V300" d0={st(d, 1, 2)} fillC={C.sand} />
  </g>
);

const Camera: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S d="M60 130 H140 L165 95 H235 L260 130 H340 V310 H60 Z" d0={st(d, 0, 3)} fillC={C.white} />
    <S el="circle" cx={200} cy={220} r={68} d0={st(d, 1, 3)} fillC={C.blueSoft} />
    <S el="circle" cx={200} cy={220} r={30} d0={st(d, 2, 3)} fillC={C.ink} />
    {f % 60 < 4 && <rect x={0} y={0} width={400} height={400} fill={C.white} opacity={0.6} />}
  </g>
);

const Bluetooth: React.FC<IconProps> = ({ d }) => (
  <g>
    <S el="rect" x={120} y={50} width={160} height={300} rx={80} d0={st(d, 0, 2)} fillC={C.blue} />
    <S d="M155 140 L245 230 L200 275 V125 L245 170 L155 260" d0={st(d, 1, 2)} stroke={C.white} strokeWidth={14} />
  </g>
);

const Headphones: React.FC<IconProps> = ({ d }) => (
  <g>
    <S d="M90 240 V200 A110 110 0 0 1 310 200 V240" d0={st(d, 0, 2)} strokeWidth={16} />
    <S el="rect" x={70} y={220} width={60} height={110} rx={20} d0={st(d, 1, 2)} fillC={C.orange} />
    <S el="rect" x={270} y={220} width={60} height={110} rx={20} d0={st(d, 1, 2)} fillC={C.orange} />
  </g>
);

const Search: React.FC<IconProps> = ({ d, f }) => (
  <g transform={`translate(${Math.sin(f / 12) * 12} ${Math.cos(f / 12) * 8})`}>
    <S el="circle" cx={170} cy={170} r={95} d0={st(d, 0, 2)} fillC={C.blueSoft} />
    <S d="M240 240 L330 330" d0={st(d, 1, 2)} strokeWidth={26} />
  </g>
);

const Brain: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S d="M200 80 C140 50 80 90 90 150 C50 180 60 250 110 270 C120 320 180 340 200 310 C220 340 280 320 290 270 C340 250 350 180 310 150 C320 90 260 50 200 80 Z" d0={st(d, 0, 2)} fillC={C.orangeSoft} />
    <S d="M200 80 V310 M140 150 C170 160 170 200 140 210 M260 150 C230 160 230 200 260 210" d0={st(d, 1, 2)} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={[150, 250, 170, 235][i]} cy={[120, 120, 260, 260][i]} r={8} fill={C.ink} opacity={fillIn(d) * (0.3 + 0.7 * Math.max(0, Math.sin(f / 5 + i * 1.6)))} />
    ))}
  </g>
);

const Book: React.FC<IconProps> = ({ d }) => (
  <g>
    <S d="M200 100 C160 70 100 70 60 90 V320 C100 300 160 300 200 330 C240 300 300 300 340 320 V90 C300 70 240 70 200 100 Z" d0={st(d, 0, 2)} fillC={C.white} />
    <S d="M200 100 V330 M95 140 H170 M95 180 H170 M95 220 H160 M230 140 H305 M230 180 H305 M230 220 H290" d0={st(d, 1, 2)} strokeWidth={6} />
  </g>
);

const Screen: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S el="rect" x={50} y={80} width={300} height={200} rx={14} d0={st(d, 0, 2)} fillC={C.white} />
    <S d="M200 280 V330 M140 330 H260" d0={st(d, 1, 2)} />
    <circle cx={90 + ((f * 6) % 220)} cy={180} r={22} fill={C.orange} opacity={fillIn(d)} />
  </g>
);

const Fan: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S el="circle" cx={200} cy={200} r={140} d0={st(d, 0, 2)} fillC={C.white} />
    <g transform={`rotate(${f * 24} 200 200)`}>
      {[0, 1, 2, 3].map((i) => (
        <S key={i} d="M200 200 C190 150 210 100 250 90 C260 140 240 180 200 200 Z" d0={st(d, 1, 2)} fillC={C.blueSoft} transform={`rotate(${i * 90} 200 200)`} />
      ))}
    </g>
    <circle cx={200} cy={200} r={16} fill={C.ink} />
  </g>
);

const Tower: React.FC<IconProps> = ({ d, f }) => (
  <g>
    <S d="M200 120 L140 350 M200 120 L260 350 M160 270 H240 M175 200 H225" d0={st(d, 0, 2)} />
    <S el="circle" cx={200} cy={110} r={16} d0={st(d, 1, 2)} fillC={C.orange} />
    {d > 0.6 &&
      [0, 1].map((i) => {
        const r = 40 + ((f * 2 + i * 50) % 100);
        return (
          <g key={i} opacity={1 - r / 140}>
            <path d={`M${200 - r} ${110 - r * 0.6} A${r} ${r} 0 0 0 ${200 - r} ${110 + r * 0.6}`} stroke={C.blue} strokeWidth={6} fill="none" />
            <path d={`M${200 + r} ${110 - r * 0.6} A${r} ${r} 0 0 1 ${200 + r} ${110 + r * 0.6}`} stroke={C.blue} strokeWidth={6} fill="none" />
          </g>
        );
      })}
  </g>
);

const Satellite: React.FC<IconProps> = ({ d, f }) => (
  <g transform={`rotate(${-20 + Math.sin(f / 25) * 6} 200 200)`}>
    <S el="rect" x={165} y={165} width={70} height={70} rx={8} d0={st(d, 0, 2)} fillC={C.sand} />
    <S el="rect" x={40} y={175} width={110} height={50} d0={st(d, 1, 2)} fillC={C.blue} />
    <S el="rect" x={250} y={175} width={110} height={50} d0={st(d, 1, 2)} fillC={C.blue} />
    <S d="M150 200 H165 M235 200 H250 M200 235 V270" d0={st(d, 1, 2)} />
  </g>
);

const Pin: React.FC<IconProps> = ({ d, f }) => (
  <g transform={`translate(0 ${-Math.abs(Math.sin(f / 8)) * 14})`}>
    <S d="M200 360 C140 270 100 220 100 160 A100 100 0 0 1 300 160 C300 220 260 270 200 360 Z" d0={st(d, 0, 2)} fillC={C.orange} />
    <S el="circle" cx={200} cy={160} r={38} d0={st(d, 1, 2)} fillC={C.paper} />
  </g>
);

const Power: React.FC<IconProps> = ({ d }) => (
  <g>
    <S d="M140 120 A110 110 0 1 0 260 120" d0={st(d, 0, 2)} strokeWidth={22} stroke={C.olive} />
    <S d="M200 70 V200" d0={st(d, 1, 2)} strokeWidth={22} stroke={C.olive} />
  </g>
);

const Hook: React.FC<IconProps> = ({ d, f }) => (
  <g transform={`rotate(${Math.sin(f / 10) * 8} 200 40)`}>
    <S d="M200 40 V250 A60 60 0 1 1 140 190" d0={st(d, 0, 2)} strokeWidth={16} />
    <S d="M140 190 L120 225 M140 190 L170 205" d0={st(d, 1, 2)} strokeWidth={12} stroke={C.orange} />
  </g>
);

export const ICONS: Record<string, React.FC<IconProps>> = {
  laptop: Laptop, desk: Desk, cabinet: Cabinet, ssd: Ssd, hdd: Hdd, router: Router, wifi: Wifi, wall: Wall,
  phone: Phone, battery: Battery, plug: Plug, lock: Lock, unlock: (p) => <Lock {...p} state="open" />, key: Key,
  bug: Bug, shield: Shield, chip: Chip, cloud: Cloud, server: Server, globe: Globe, eye: Eye, ad: Ad, mail: Mail,
  usb: Usb, update: Update, file: File, zip: Zip, trash: Trash, camera: Camera, bluetooth: Bluetooth,
  headphones: Headphones, search: Search, brain: Brain, book: Book, screen: Screen, fan: Fan, tower: Tower,
  satellite: Satellite, pin: Pin, power: Power, hook: Hook,
};

export const Icon: React.FC<IconProps & { name: string; size: number }> = ({ name, size, ...p }) => {
  const Cmp = ICONS[name] ?? File;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible" }}>
      <Cmp {...p} />
    </svg>
  );
};
