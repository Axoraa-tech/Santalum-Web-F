import type { SVGProps } from "react";

const PATHS = {
  today: "M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z",
  orders: "M4 7.5 12 4l8 3.5v9L12 20l-8-3.5zM4 7.5l8 3.5 8-3.5M12 11v9",
  products: "M12 3.5c3.6 0 6.5 2.9 6.5 6.5 0 4.6-6.5 10.5-6.5 10.5S5.5 14.6 5.5 10c0-3.6 2.9-6.5 6.5-6.5zM12 8v5M9.5 10.5h5",
  customers: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 14.8c2 .7 3.2 2.5 3.5 5.2",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  back: "M14.5 5.5 8 12l6.5 6.5",
  chevron: "M9.5 5.5 16 12l-6.5 6.5",
  down: "M5.5 9.5 12 16l6.5-6.5",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 20 20",
  phone: "M6.5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z",
  chat: "M4.5 19.5l1.2-3.6A7.5 7.5 0 1 1 8.6 18.6zM9 12h.01M12 12h.01M15 12h.01",
  mail: "M4 6h16v12H4zM4 6.5l8 6 8-6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h13M13 6.5l5.5 5.5-5.5 5.5",
  print: "M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z",
  stock: "M4 20V9l8-5 8 5v11M8 20v-6h8v6M8 17h8",
  star: "M12 4.5l2.3 4.7 5.2.8-3.75 3.6.9 5.1L12 16.3l-4.65 2.4.9-5.1L4.5 10l5.2-.8z",
  coupon: "M4 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v2h16v-2a2 2 0 0 1 0-4 2 2 0 0 1 0-4V6H4zM14 6v12",
  content: "M4 5h16v14H4zM4 9h16M8 13h8M8 16h5",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7",
  out: "M14 4h5v16h-5M10 8l-4 4 4 4M6 12h9",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  trash: "M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13",
  note: "M5 4h14v11l-5 5H5zM14 20v-5h5",
} as const;

export type A5IconName = keyof typeof PATHS;

export function I({ n, size = 22, ...rest }: { n: A5IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={n === "more" ? 3 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d={PATHS[n]} />
    </svg>
  );
}
