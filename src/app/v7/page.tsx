import { CircleForm } from "@/components/CircleForm";
import { IncenseSmoke } from "@/components/IncenseSmoke";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 7 — Dhoop: one incense stick, smoke rising at its own pace. */
export default function Dhoop() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-night text-linen">
      <OptionNav n={7} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 66% 70%, rgba(139,94,60,0.18) 0%, rgba(28,20,16,0) 70%)" }}
      />
      <IncenseSmoke className="fade absolute inset-0 h-full w-full" />

      <div className="relative flex min-h-svh flex-col justify-between px-6 py-10 md:px-16 md:py-14">
        <Wordmark className="rise text-pale" markClass="text-dust" />
        <div className="max-w-xl max-md:mt-[38vh]">
          <p className="rise text-xs tracking-[0.34em] text-dust" style={{ animationDelay: "0.4s" }}>
            RITUAL · OPENING SOON
          </p>
          <h1 className="rise mt-5 font-serif text-5xl font-light leading-[1.04] md:text-7xl" style={{ animationDelay: "0.6s" }}>
            Some things are
            <br />
            not hurried.
          </h1>
          <p className="rise mt-8 max-w-md text-[17px] leading-relaxed text-pale/75" style={{ animationDelay: "0.8s" }}>
            Red sandalwood takes decades to form. The Maison is taking a little longer to open. Morning rituals, quiet
            objects and gifts that remain.
          </p>
          <CircleForm className="rise mt-12" />
        </div>
      </div>
    </main>
  );
}
