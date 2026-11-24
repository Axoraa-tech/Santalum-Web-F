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

export function Logo() {
  return (
    <Link href="/maison" className="group flex items-center gap-2.5" aria-label="Santalum Maison, home">
      <WoodDisc className="size-7 transition-transform duration-700 ease-out-soft group-hover:rotate-[120deg]" />
      <span className="font-display text-[20px] leading-none tracking-[-0.02em] max-[379px]:hidden sm:text-[24px]">santalum</span>
    </Link>
  );
}
