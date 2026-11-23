import { CircleForm } from "@/components/CircleForm";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";

/** 8 — Cover: a magazine-style first issue. The masthead is half red, half ivory. */
export default function Cover() {
  return (
    <main className="relative h-svh min-h-[680px] overflow-hidden bg-[#0e0c0b] text-linen">
      <OptionNav n={8} />
      <Photo p={PHOTOS.malaHand} priority className="object-[70%_50%] md:object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e0c0b] via-[#0e0c0b]/40 to-transparent" />

      <div className="relative flex h-full flex-col px-6 pb-16 pt-6 md:px-10 md:pb-10">
        <div className="flex items-baseline justify-between text-[11px] tracking-[0.3em] text-pale/70">
          <span>MAISON · INDIA</span>
          <span>ISSUE 01 — THE OPENING</span>
        </div>

        {/* masthead: red half / white half */}
        <h1 className="relative mt-2 select-none font-serif text-[22vw] font-light leading-[0.82] tracking-[-0.02em] md:text-[19vw]">
          <span className="inline-block text-[#c0573a] [clip-path:inset(0_50%_0_0)]">Santalum</span>
          <span aria-hidden className="absolute left-0 top-0 inline-block text-pale [clip-path:inset(0_0_0_50%)]">
            Santalum
          </span>
        </h1>

        <div className="mt-auto grid gap-10 md:grid-cols-2 md:items-end">
          <ol className="space-y-6">
            <CoverLine dot="bg-[#c0573a]" title="Red & White" text="The two sandalwoods of India, in one house" />
            <CoverLine dot="bg-pale" title="The 2011 Vault" text="Twenty-one pieces of aged heartwood, each numbered" />
            <CoverLine dot="bg-dust" title="Ritual" text="Beads, powders and the morning lamp" />
          </ol>
          <div className="md:justify-self-end">
            <p className="mb-6 font-serif text-2xl font-light">Opening soon.</p>
            <CircleForm />
          </div>
        </div>
      </div>
    </main>
  );
}

function CoverLine({ dot, title, text }: { dot: string; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className={`mt-3 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span>
        <span className="block font-serif text-2xl md:text-3xl">{title}</span>
        <span className="block text-[15px] text-pale/75">{text}</span>
      </span>
    </li>
  );
}
