/** Contour-ring mark: the wordmark's little emblem, like the rings on a cut log or a hill on a map. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <path d="M14 2.5c6.6 0 11.5 4.6 11.5 11.2 0 6.9-5.2 11.8-11.7 11.8C7.4 25.5 2.5 20.6 2.5 14 2.5 7.5 7.6 2.5 14 2.5z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M14.3 7c3.9 0 6.8 2.8 6.8 6.7 0 4.1-3 7-7 7-3.9 0-6.7-2.9-6.7-6.8C7.4 9.9 10.4 7 14.3 7z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="14.2" cy="13.8" r="2.6" fill="var(--a-accent)" />
    </svg>
  );
}
