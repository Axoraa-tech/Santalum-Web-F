import { CircleForm } from "@/components/CircleForm";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 2 — Threshold: a kolam drawing itself, the way it is drawn at a doorway each morning. */
export default function Threshold() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-linen text-night">
      <OptionNav n={2} />
      <div className="mx-auto grid min-h-svh max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-[1.05fr_1fr] md:gap-20 md:px-12">
        <Kolam className="mx-auto w-[min(86vw,520px)]" />

        <div>
          <Wordmark className="rise" markClass="text-rakta" />
          <p className="rise mt-14 text-xs tracking-[0.34em] text-rakta" style={{ animationDelay: "0.3s" }}>
            RED SANDALWOOD · INDIA
          </p>
          <h1 className="rise mt-5 font-serif text-5xl font-light leading-[1.04] md:text-7xl" style={{ animationDelay: "0.45s" }}>
            At the threshold.
          </h1>
          <p className="rise mt-8 max-w-md text-[17px] leading-relaxed text-walnut" style={{ animationDelay: "0.6s" }}>
            Each morning, homes across South India draw a kolam at the doorway to welcome what is about to arrive.
          </p>
          <p className="rise mt-4 max-w-md text-[17px] leading-relaxed text-walnut" style={{ animationDelay: "0.7s" }}>
            Santalum Maison is almost here — contemporary objects shaped from the deep red heartwood of{" "}
            <em className="font-serif text-lg">Pterocarpus santalinus</em>.
          </p>
          <CircleForm tone="light" className="rise mt-12" />
        </div>
      </div>
    </main>
  );
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function petal(angle: number, len: number, width: number) {
  const a = (angle * Math.PI) / 180;
  const ux = Math.cos(a), uy = Math.sin(a);
  const px = -uy, py = ux;
  const tip = [ux * len, uy * len];
  const c1 = [ux * len * 0.5 + px * width, uy * len * 0.5 + py * width];
  const c2 = [ux * len * 0.5 - px * width, uy * len * 0.5 - py * width];
  return `M0 0Q${r1(c1[0])} ${r1(c1[1])} ${r1(tip[0])} ${r1(tip[1])}Q${r1(c2[0])} ${r1(c2[1])} 0 0Z`;
}

function wavyRing(r: number, amp: number, lobes: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2;
    const rr = r + amp * Math.sin(lobes * t);
    pts.push(`${i ? "L" : "M"}${r1(Math.cos(t) * rr)} ${r1(Math.sin(t) * rr)}`);
  }
  return pts.join("") + "Z";
}

function eyeLoop(angle: number, dist: number, len: number, w: number) {
  const a = (angle * Math.PI) / 180;
  const cx = Math.cos(a) * dist, cy = Math.sin(a) * dist;
  const ux = Math.cos(a), uy = Math.sin(a);
  const px = -uy, py = ux;
  const p0 = [cx - ux * len, cy - uy * len];
  const p1 = [cx + ux * len, cy + uy * len];
  return `M${r1(p0[0])} ${r1(p0[1])}C${r1(p0[0] + px * w)} ${r1(p0[1] + py * w)} ${r1(p1[0] + px * w)} ${r1(p1[1] + py * w)} ${r1(p1[0])} ${r1(p1[1])}C${r1(p1[0] - px * w)} ${r1(p1[1] - py * w)} ${r1(p0[0] - px * w)} ${r1(p0[1] - py * w)} ${r1(p0[0])} ${r1(p0[1])}Z`;
}

// Pulli (dot grid) in a diamond, the classic kolam layout
const DOTS: [number, number][] = [];
for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) if (Math.abs(i) + Math.abs(j) <= 6) DOTS.push([i * 28, j * 28]);

const STAR = "M0 -186Q42 -42 186 0Q42 42 0 186Q-42 42 -186 0Q-42 -42 0 -186Z";
const STAR2 = "M0 -150Q56 -56 150 0Q56 56 0 150Q-56 56 -150 0Q-56 -56 0 -150Z";

function Kolam({ className }: { className?: string }) {
  const lines: { d: string; delay: number; w?: number }[] = [];
  for (let k = 0; k < 8; k++) lines.push({ d: petal(k * 45 - 90, 70, 26), delay: 0.2 + k * 0.12 });
  for (let k = 0; k < 8; k++) lines.push({ d: petal(k * 45 - 67.5, 44, 14), delay: 1.1 + k * 0.08 });
  lines.push({ d: wavyRing(108, 9, 8), delay: 1.8, w: 1.4 });
  for (let k = 0; k < 8; k++) lines.push({ d: eyeLoop(k * 45 - 90, 148, 22, 16), delay: 2.4 + k * 0.1 });
  lines.push({ d: STAR2, delay: 3.1 });
  lines.push({ d: STAR, delay: 3.5, w: 1.6 });

  return (
    <svg viewBox="-200 -200 400 400" className={className} aria-hidden>
      <g fill="#5c4331">
        {DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.1" className="fade" style={{ animationDelay: `${(Math.abs(x) + Math.abs(y)) / 400}s` }} />
        ))}
      </g>
      <g fill="none" stroke="#6e2a1f" strokeLinecap="round" strokeLinejoin="round">
        {lines.map((l, i) => (
          <path key={i} d={l.d} pathLength={1} strokeWidth={l.w ?? 1.2} className="draw" style={{ animationDelay: `${l.delay}s` }} />
        ))}
      </g>
      <circle r="4" fill="#6e2a1f" className="fade" style={{ animationDelay: "4.4s" }} />
    </svg>
  );
}
