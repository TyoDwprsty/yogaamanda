import type { CSSProperties, ReactNode } from "react";

// Model-kit parts drifting down behind the page: runner corners with a part still on its
// gates, the letter tag from a sprue, nubs, polycaps, small armor plates and screws, all in
// flat gold. Pure CSS animation on transforms only, so it stays on the compositor.
// Deterministic (seeded), so server and client render the same markup. Pieces past the
// mobile count are hidden on small screens; see .parts in globals.css for the safe zone
// over the text column and the reduced-motion fallback.

const DESKTOP = 24;
const MOBILE = 10;

const F = "var(--gold)";
const D = "var(--gold-lo)";

type Shape = { vw: number; vh: number; size: number; weight: number; draw: ReactNode };

const SHAPES: Shape[] = [
  {
    // corner of a runner frame, one part still attached by two gates
    vw: 40,
    vh: 40,
    size: 30,
    weight: 1,
    draw: (
      <>
        <path d="M5 5h31M5 5v31" stroke={F} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M5 20h8M20.5 5v8" stroke={F} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <rect x="12" y="12" width="17" height="15" rx="2.5" fill={F} />
        <circle cx="20.5" cy="19.5" r="2.6" fill={D} />
      </>
    ),
  },
  {
    // sprue tag with its letter
    vw: 32,
    vh: 30,
    size: 22,
    weight: 1.5,
    draw: (
      <>
        <path d="M3 26.5h26" stroke={F} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M16 26v-7" stroke={F} strokeWidth="2.4" />
        <rect x="6.5" y="2" width="19" height="18" rx="3" fill={F} />
        <path
          d="M11.8 16.5 16 6l4.2 10.5M13.3 13h5.4"
          fill="none"
          stroke={D}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    // straight runner segment with two snipped gates
    vw: 44,
    vh: 16,
    size: 32,
    weight: 2,
    draw: (
      <>
        <path d="M3 8h38" stroke={F} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M14 8V2.5M30 8v5.5" stroke={F} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  {
    // small armor plate with panel lines and a peg hole
    vw: 30,
    vh: 22,
    size: 22,
    weight: 2,
    draw: (
      <>
        <path d="M2 4.5 6.5 1H23l5 5v11.5L24.5 21H2z" fill={F} />
        <path d="M7 7h11M7 11h7" stroke={D} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="22" cy="14" r="2.4" fill={D} />
      </>
    ),
  },
  {
    // polycap
    vw: 24,
    vh: 24,
    size: 15,
    weight: 2,
    draw: (
      <path
        fillRule="evenodd"
        d="M12 1.5l9.1 5.25v10.5L12 22.5l-9.1-5.25V6.75zM12 7.4a4.6 4.6 0 1 0 0 9.2a4.6 4.6 0 1 0 0-9.2z"
        fill={F}
      />
    ),
  },
  {
    // screw
    vw: 14,
    vh: 38,
    size: 10,
    weight: 2,
    draw: (
      <>
        <rect x="1" y="1" width="12" height="6.5" rx="2" fill={F} />
        <path d="M4.4 4.2h5.2" stroke={D} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4.6 7.5h4.8V30L7 36.5 4.6 30z" fill={F} />
        <path
          d="M3 11.6l8-1.8M3 15.6l8-1.8M3 19.6l8-1.8M3 23.6l8-1.8M3 27.6l8-1.8"
          stroke={F}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    // gate nub left over after cutting
    vw: 12,
    vh: 10,
    size: 9,
    weight: 3,
    draw: (
      <>
        <path d="M1.2 9 3.4 1.6h5.2L10.8 9z" fill={F} />
        <path d="M3.6 1.6h4.8" stroke={D} strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
];

const TOTAL_WEIGHT = SHAPES.reduce((n, s) => n + s.weight, 0);

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function pick(r: number) {
  let acc = r * TOTAL_WEIGHT;
  for (const s of SHAPES) {
    acc -= s.weight;
    if (acc <= 0) return s;
  }
  return SHAPES[SHAPES.length - 1];
}

type Piece = { shape: Shape; fall: CSSProperties; sway: CSSProperties; tumble: CSSProperties; angle: number };

function makePieces(): Piece[] {
  const rnd = rng(11);
  return Array.from({ length: DESKTOP }, () => {
    const d = rnd();
    const tier = d > 0.86 ? "near" : d < 0.4 ? "far" : "mid";
    const scale = tier === "near" ? 1.35 : tier === "far" ? 0.7 : 1;
    // seconds to cross ~124vh
    const dur = (tier === "near" ? 13 : tier === "far" ? 28 : 19) * (0.85 + rnd() * 0.3);
    const shape = pick(rnd());
    const w = shape.size * scale;
    const h = (w * shape.vh) / shape.vw;
    const axes = [
      ["1", "0.3"],
      ["0.3", "1"],
      ["0.7", "0.7"],
    ][Math.floor(rnd() * 3)];
    return {
      shape,
      angle: Math.floor(rnd() * 360),
      fall: {
        left: `${(rnd() * 96 + 2).toFixed(2)}%`,
        width: `${w.toFixed(1)}px`,
        height: `${h.toFixed(1)}px`,
        opacity: tier === "near" ? 0.6 : tier === "far" ? 0.45 : 0.85,
        filter: tier === "near" ? "blur(1.2px)" : undefined,
        animation: `part-fall ${dur.toFixed(1)}s linear -${(rnd() * dur).toFixed(1)}s infinite`,
        "--rest": `${(rnd() * 92 + 2).toFixed(1)}vh`,
      } as CSSProperties,
      sway: {
        fontSize: `${(10 + rnd() * 16).toFixed(0)}px`,
        animation: `part-sway ${(3.4 + rnd() * 2.6).toFixed(1)}s ease-in-out -${(rnd() * 3).toFixed(1)}s infinite alternate`,
      },
      tumble: {
        "--tx": axes[0],
        "--ty": axes[1],
        animation: `part-tumble ${(7 + rnd() * 6).toFixed(1)}s linear -${(rnd() * 6).toFixed(1)}s infinite`,
      } as CSSProperties,
    };
  });
}

const PIECES = makePieces();

export function Confetti() {
  return (
    <div aria-hidden="true" className="parts">
      {PIECES.map((p, i) => (
        <div key={i} className={`part ${i >= MOBILE ? "max-md:hidden" : ""}`} style={p.fall}>
          <div className="size-full [perspective:420px]" style={p.sway}>
            <div className="size-full [transform-style:preserve-3d]" style={p.tumble}>
              <svg
                viewBox={`0 0 ${p.shape.vw} ${p.shape.vh}`}
                className="block size-full overflow-visible"
                style={{ transform: `rotate(${p.angle}deg)` }}
              >
                {p.shape.draw}
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
