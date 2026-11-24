import Link from "next/link";
import { Wordmark } from "@/components/Lotus";
import { OPTIONS } from "@/components/OptionNav";

/** Internal picker for the coming-soon options. Replace with the chosen design. */
export default function Home() {
  return (
    <main className="min-h-svh bg-linen px-6 py-16 text-night md:px-16 md:py-24">
      <Wordmark markClass="text-rakta" />
      <h1 className="mt-16 font-serif text-4xl font-light md:text-5xl">Coming-soon page — {OPTIONS.length} options</h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-walnut">
        Red and white sandalwood in every one. Photography is placeholder from Unsplash. Open one, then use the arrows
        at the bottom to move between them.
      </p>
      <ol className="mt-14 max-w-3xl divide-y divide-walnut/20 border-y border-walnut/20">
        {OPTIONS.map((o, i) => (
          <li key={o.slug}>
            <Link href={`/${o.slug}`} className="group flex items-baseline gap-6 py-6">
              <span className="w-8 font-serif text-2xl text-rakta">{String(i + 1).padStart(2, "0")}</span>
              <span className="w-36 font-serif text-2xl group-hover:text-rakta">{o.name}</span>
              <span className="flex-1 text-[16px] text-walnut">{o.note}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
