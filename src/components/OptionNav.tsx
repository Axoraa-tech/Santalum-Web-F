import Link from "next/link";

export const OPTIONS = [
  { slug: "s1", name: "Diptych", note: "Red and white sandalwood powder, side by side, the name on the seam." },
  { slug: "s2", name: "Horizon", note: "White above, red below. The name sits across the line." },
  { slug: "s3", name: "Specimens", note: "Two plates, catalogued like a museum collection." },
  { slug: "s4", name: "Temple", note: "One Hoysala corridor, toned red on the left and pale on the right." },
  { slug: "s5", name: "Triptych", note: "Red powder, a lit diya, white powder." },
  { slug: "s6", name: "Hand", note: "A carver at work, with the two woods beside the text." },
  { slug: "s7", name: "Two Woods", note: "Hover a side and it opens. Sanskrit names for both." },
  { slug: "s8", name: "Cover", note: "A magazine cover. The masthead is half red, half ivory." },
  { slug: "s9", name: "Invitation", note: "A card over incense smoke, sealed in red wax." },
  { slug: "s10", name: "Lookbook", note: "Three red materials over three white ones, on linen." },
] as const;

/** Review-only switcher between design options. Remove before launch. */
export function OptionNav({ n }: { n: number }) {
  const prev = OPTIONS[(n - 2 + OPTIONS.length) % OPTIONS.length];
  const next = OPTIONS[n % OPTIONS.length];
  return (
    <nav className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-night/80 px-4 py-1.5 text-xs tracking-wider text-pale/80 backdrop-blur">
      <Link href={`/${prev.slug}`} className="hover:text-linen" aria-label="Previous option">
        ←
      </Link>
      <Link href="/" className="whitespace-nowrap hover:text-linen">
        {n} / {OPTIONS.length} · {OPTIONS[n - 1].name}
      </Link>
      <Link href={`/${next.slug}`} className="hover:text-linen" aria-label="Next option">
        →
      </Link>
    </nav>
  );
}
