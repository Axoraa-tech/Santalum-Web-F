"use client";

import { useSyncExternalStore } from "react";
import { s } from "../cls";
import { cx } from "../data";

/** Mysuru time (IST, UTC+5:30, no daylight saving), ticking once a second on the client. */

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const nowSeconds = () => Math.floor(Date.now() / 1000);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Days since 1970-01-01 to a civil date (Howard Hinnant's algorithm). */
function civil(days: number) {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { m, d };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function ClockTile() {
  const sec = useSyncExternalStore(subscribe, nowSeconds, () => 0);
  const ready = sec > 0;
  const ist = sec + 19800;
  const h = Math.floor(ist / 3600) % 24;
  const m = Math.floor(ist / 60) % 60;
  const ss = ist % 60;
  const days = Math.floor(ist / 86400);
  const { m: mon, d } = civil(days);
  const day = DAYS[(days + 4) % 7];
  const daylight = h >= 6 && h < 18;

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[22px] font-medium leading-none tracking-[-0.03em]">Mysuru</p>
          <p className={cx(s.mono, s.muted, "mt-1.5 text-[10.5px]")}>12.30° N, 76.64° E</p>
        </div>
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="shrink-0 -rotate-90">
          <circle cx="17" cy="17" r="14" fill="none" stroke="var(--b-tile2)" strokeWidth="3" />
          <circle
            cx="17"
            cy="17"
            r="14"
            fill="none"
            stroke="var(--m-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={60}
            strokeDasharray="60"
            strokeDashoffset={ready ? 60 - (ss + 1) : 60}
            style={{ transition: ss === 0 || !ready ? "none" : "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
      </div>

      <p className={cx(s.monoWide, "mt-auto pt-3 text-[clamp(30px,17cqw,58px)] leading-none")} suppressHydrationWarning>
        {ready ? `${pad(h)}:${pad(m)}` : "--:--"}
        <span className="text-[0.42em] text-accent">{ready ? `:${pad(ss)}` : ""}</span>
      </p>

      <div className="mt-3 flex items-center gap-[3px]" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-500"
            style={{
              background: ready && i === h ? "var(--m-accent)" : i >= 6 && i < 18 ? "#e4e1da" : "#c9c6be",
            }}
          />
        ))}
      </div>
      <p className={cx(s.mono, s.muted, "mt-2 flex justify-between text-[10.5px]")}>
        <span>{ready ? `${day} ${d} ${MONTHS[mon - 1]}, IST` : "IST, UTC+5:30"}</span>
        <span className="hidden @min-[220px]:inline">{ready ? (daylight ? "Daylight" : "After dark") : ""}</span>
      </p>
    </div>
  );
}
