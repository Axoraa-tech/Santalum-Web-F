/** Line-drawn lotus mark, taken from the client's packaging mockups. Uses currentColor. */
export function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M32 4C38 12 38 26 32 34C26 26 26 12 32 4Z" />
      <path d="M32 34C28 24 20 16 12 14C12 24 20 32 32 34Z" />
      <path d="M32 34C36 24 44 16 52 14C52 24 44 32 32 34Z" />
      <path d="M32 34C22 30 10 28 2 24C8 32 20 36 32 34Z" />
      <path d="M32 34C42 30 54 28 62 24C56 32 44 36 32 34Z" />
      <path d="M16 38.5H48" />
    </svg>
  );
}

/** Text-only wordmark. */
export function Mark({ className = "" }: { className?: string }) {
  return <span className={`whitespace-nowrap font-serif text-[15px] tracking-[0.32em] ${className}`}>SANTALUM MAISON</span>;
}

/** Lotus + wordmark. */
export function Wordmark({ className = "", markClass = "" }: { className?: string; markClass?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Lotus className={`h-6 w-10 ${markClass}`} />
      <span className="font-serif text-lg tracking-[0.28em]">SANTALUM MAISON</span>
    </div>
  );
}
