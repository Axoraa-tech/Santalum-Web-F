import { CircleForm } from "@/components/CircleForm";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 3 — Heartwood: the cross-section of a red sandalwood log, rings turning very slowly. */
export default function Heartwood() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-night text-linen">
      <OptionNav n={3} />
      <div className="fade pointer-events-none absolute -right-[45vmin] top-1/2 w-[120vmin] -translate-y-1/2 max-md:-right-[40vw] max-md:top-[-12vh] max-md:w-[120vw] max-md:translate-y-0">
        <Rings />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, #1c1410 0%, #1c1410 34%, rgba(28,20,16,0.55) 62%, rgba(28,20,16,0) 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ background: "linear-gradient(180deg, rgba(28,20,16,0) 0%, rgba(28,20,16,0.6) 30%, #1c1410 48%)" }}
      />

      <div className="relative flex min-h-svh max-w-6xl flex-col justify-between px-6 py-10 max-md:pt-[44vh] md:px-16 md:py-14">
        <Wordmark className="rise text-pale max-md:hidden" markClass="text-dust" />
        <div className="md:max-w-xl">
          <p className="rise text-xs tracking-[0.34em] text-dust" style={{ animationDelay: "0.2s" }}>
            THE MAISON · OPENING SOON
          </p>
          <h1 className="rise mt-5 font-serif text-5xl font-light leading-[1.04] md:text-8xl" style={{ animationDelay: "0.35s" }}>
            From the
            <br />
            Heartwood.
          </h1>
          <p className="rise mt-8 max-w-md text-[17px] leading-relaxed text-pale/75" style={{ animationDelay: "0.5s" }}>
            Every ring is a year the wood spent becoming itself. Dense. Deeply coloured. Distinctive in grain. We are
            preparing the first objects to be made from it.
          </p>
          <CircleForm className="rise mt-12" />
        </div>
        <p className="mt-16 text-sm text-pale/40">
          <em className="font-serif text-base">Pterocarpus santalinus</em> · Eastern Ghats, India
        </p>
      </div>
    </main>
  );
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(2011);
const r1 = (n: number) => Math.round(n * 10) / 10;

function ringPath(r: number, cx: number, cy: number) {
  const p1 = rnd() * 6.28, p2 = rnd() * 6.28, p3 = rnd() * 6.28;
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 2;
    const rr = r * (1 + 0.03 * Math.sin(3 * t + p1) + 0.014 * Math.sin(7 * t + p2) + 0.006 * Math.sin(17 * t + p3));
    pts.push(`${i ? "L" : "M"}${r1(cx + Math.cos(t) * rr)} ${r1(cy + Math.sin(t) * rr)}`);
  }
  return pts.join("") + "Z";
}

// Bark, pale sapwood, then deep red heartwood toward the pith (slightly off-centre, as in real logs)
const HEART = ["#6e2a1f", "#7a3324", "#64251b", "#733022", "#5c2118"];
const RINGS: { d: string; fill: string }[] = [];
{
  let r = 400;
  let k = 0;
  while (r > 10) {
    const t = 1 - r / 400;
    const cx = 400 + t * 18, cy = 400 - t * 12;
    let fill: string;
    if (k === 0) fill = "#3b271c"; // bark
    else if (k < 4) fill = ["#c8a77f", "#bf9c72", "#c4a37a"][k - 1]; // sapwood
    else fill = HEART[k % HEART.length];
    RINGS.push({ d: ringPath(r, cx, cy), fill });
    r -= k === 0 ? 14 : k < 4 ? 9 : 7 + rnd() * 12;
    k++;
  }
}

function Rings() {
  return (
    <svg viewBox="0 0 800 800" className="turn-slow block h-auto w-full" aria-hidden>
      <g stroke="rgba(28,20,16,0.35)" strokeWidth="0.8">
        {RINGS.map((r, i) => (
          <path key={i} d={r.d} fill={r.fill} />
        ))}
      </g>
      {/* radial check (drying crack) */}
      <path d="M430 380L520 300L548 262L600 214L612 196" fill="none" stroke="#1c1410" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M430 380L470 420L488 452" fill="none" stroke="#1c1410" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
