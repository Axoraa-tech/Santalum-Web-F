/** Line icons drawn for the Maison: 1.5px strokes, round joins, no fills unless active. */

export function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path d="M6 8.5h12l-.9 10.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8L6 8.5Z" strokeLinejoin="round" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ filled = false, className = "" }: { filled?: boolean; className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path
        d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 8.9 6.2c1.3 0 2.4.6 3.1 1.6.7-1 1.8-1.6 3.1-1.6A3.9 3.9 0 0 1 19 10.1c0 5.1-7 9.4-7 9.4Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={className}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
