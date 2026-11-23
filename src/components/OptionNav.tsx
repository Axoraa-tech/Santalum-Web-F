import Link from "next/link";

export const OPTIONS = [
  { slug: "v1", name: "Sanctum", note: "A temple doorway in brass line, a diya burning inside." },
  { slug: "v2", name: "Threshold", note: "A kolam drawing itself at the doorway, as at dawn." },
  { slug: "v3", name: "Heartwood", note: "The growth rings of red sandalwood, turning slowly." },
  { slug: "v4", name: "Mala", note: "108 beads, counted one by one toward the opening." },
  { slug: "v5", name: "Manuscript", note: "Palm-leaf pages bound between red sandalwood covers." },
  { slug: "v6", name: "Edition", note: "A book spread. The Lineage, and The 2011 Vault — 21 pieces." },
  { slug: "v7", name: "Dhoop", note: "A single incense stick. Smoke rising, unhurried." },
] as const;

/** Review-only switcher between design options. Remove before launch. */
export function OptionNav({ n }: { n: number }) {
  const prev = OPTIONS[(n - 2 + OPTIONS.length) % OPTIONS.length];
  const next = OPTIONS[n % OPTIONS.length];
  return (
    <nav className="fixed right-3 top-3 z-50 flex items-center gap-3 rounded-full bg-night/70 px-4 py-1.5 text-xs tracking-wider text-pale/80 backdrop-blur">
      <Link href={`/${prev.slug}`} className="hover:text-linen" aria-label="Previous option">
        ←
      </Link>
      <Link href="/" className="hover:text-linen">
        Option {n} of {OPTIONS.length} · {OPTIONS[n - 1].name}
      </Link>
      <Link href={`/${next.slug}`} className="hover:text-linen" aria-label="Next option">
        →
      </Link>
    </nav>
  );
}
