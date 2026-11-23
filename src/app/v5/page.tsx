import type { CSSProperties, ReactNode } from "react";
import { CircleForm } from "@/components/CircleForm";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 5 — Manuscript: palm-leaf pages (tala-patra) bound between red sandalwood covers. */
export default function Manuscript() {
  const paper: CSSProperties = {
    backgroundColor: "#c8b89a",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.36 0 0 0 0 0.26 0 0 0 0 0.19 0 0 0 0.16 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")",
  };

  return (
    <main className="relative min-h-svh overflow-hidden text-night" style={paper}>
      <OptionNav n={5} />
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-5 py-10 md:px-12 md:py-14">
        <Wordmark className="rise" markClass="text-rakta" />

        <div className="relative my-14 flex flex-1 flex-col justify-center">
          {/* binding cords through both holes */}
          <div className="pointer-events-none absolute inset-y-0 left-[13%] w-px bg-rakta/80 md:left-[11%]" />
          <div className="pointer-events-none absolute inset-y-0 right-[13%] w-px bg-rakta/80 md:right-[11%]" />

          <Cover />
          <Leaf delay={0.3}>
            <p className="font-deva text-4xl text-walnut md:text-5xl" lang="sa">
              चन्दनम्
            </p>
            <p className="mt-1 text-xs tracking-[0.3em] text-walnut/70">CHANDANAM · SANDALWOOD</p>
          </Leaf>
          <Leaf delay={0.5}>
            <h1 className="font-serif text-3xl font-light leading-tight text-night md:text-5xl">
              Four Thousand Years Found Its Way To You.
            </h1>
          </Leaf>
          <Leaf delay={0.7}>
            <p className="font-serif text-xl italic text-walnut md:text-2xl">
              India&rsquo;s sandalwood house is opening soon.
            </p>
          </Leaf>
          <Cover delay={0.9} />
        </div>

        <div className="rise flex flex-col gap-10 md:flex-row md:items-end md:justify-between" style={{ animationDelay: "1.1s" }}>
          <p className="max-w-sm text-[17px] leading-relaxed text-walnut">
            Jewellery, ritual objects and gifting, shaped from the deep red heartwood of{" "}
            <em className="font-serif text-lg">Pterocarpus santalinus</em>.
          </p>
          <CircleForm tone="light" />
        </div>
      </div>
    </main>
  );
}

function Leaf({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <div
      className="rise relative mx-auto my-1.5 flex w-full items-center justify-center px-[19%] py-7 text-center md:min-h-28 md:px-[17%]"
      style={{
        animationDelay: `${delay}s`,
        borderRadius: "56px / 50%",
        background:
          "repeating-linear-gradient(180deg, rgba(92,67,49,0.05) 0 1px, transparent 1px 5px), linear-gradient(180deg, #e6d3a6 0%, #d8c08f 48%, #c4a670 100%)",
        boxShadow: "inset 0 0 0 1px rgba(92,67,49,0.25), inset 0 -6px 14px rgba(92,67,49,0.18), 0 6px 16px rgba(28,20,16,0.12)",
      }}
    >
      <Hole side="left" />
      <Hole side="right" />
      <div>{children}</div>
    </div>
  );
}

function Hole({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${side === "left" ? "left-[13%] -translate-x-1/2 md:left-[11%]" : "right-[13%] translate-x-1/2 md:right-[11%]"}`}
      style={{ background: "#3b271c", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)" }}
    />
  );
}

function Cover({ delay = 0.1 }: { delay?: number }) {
  return (
    <div
      className="rise relative mx-auto my-1.5 h-7 w-[104%] -translate-x-[2%] md:h-9"
      style={{
        animationDelay: `${delay}s`,
        borderRadius: "12px",
        background:
          "repeating-linear-gradient(176deg, rgba(28,20,16,0.12) 0 2px, transparent 2px 9px), linear-gradient(180deg, #8a3a28 0%, #6e2a1f 55%, #4f1c14 100%)",
        boxShadow: "0 8px 18px rgba(28,20,16,0.25), inset 0 1px 0 rgba(255,220,180,0.15)",
      }}
    >
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-brass/80 bg-brass/30" />
    </div>
  );
}
