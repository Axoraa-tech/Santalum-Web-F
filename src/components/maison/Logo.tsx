import Link from "next/link";

/** A small cross-section of the current wood, and the name in the soft serif. */
export function WoodDisc({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] ${className}`}>
      <span className="w-red">
        <span className="ring-red absolute inset-0" />
      </span>
      <span className="w-white">
        <span className="ring-white absolute inset-0" />
      </span>
    </span>
  );
}

/** `full` keeps the name on phones (the header shows only the slice there, to fit the account and bag). */
export function Logo({ full = false }: { full?: boolean }) {
  return (
    <Link href="/maison" className="group flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)" aria-label="Santalum Maison, home">
      <WoodDisc className="size-7 transition-transform duration-700 ease-out-soft group-hover:rotate-[120deg]" />
      <span className={`font-display text-[20px] leading-none tracking-[-0.02em] ${full ? "" : "max-sm:hidden"} sm:text-[24px]`}>santalum</span>
    </Link>
  );
}
