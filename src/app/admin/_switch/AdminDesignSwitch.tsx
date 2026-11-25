"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const DESIGNS = [
  { n: 1, base: "/admin", name: "Studio" },
  { n: 2, base: "/admin/v2", name: "Ledger" },
  { n: 3, base: "/admin/v3", name: "Console" },
  { n: 4, base: "/admin/v4", name: "Atelier board" },
  { n: 5, base: "/admin/v5", name: "Pocket" },
  { n: 6, base: "/admin/v6", name: "Report" },
];

/** Floating picker for the six admin designs. Keeps the current section (orders, products…) when switching. */
export function AdminDesignSwitch() {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const m = pathname.match(/^\/admin\/v([2-6])(\/.*)?$/);
  const current = m ? Number(m[1]) : 1;
  const rest = m ? (m[2] ?? "") : pathname.replace(/^\/admin/, "");

  return (
    <div className="ads-switch" data-open={open || undefined}>
      {open && (
        <ul className="ads-list" role="list">
          {DESIGNS.map((d) => (
            <li key={d.n}>
              <Link href={d.base + rest} aria-current={d.n === current ? "page" : undefined} onClick={() => setOpen(false)}>
                <span className="ads-n">{d.n}</span>
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="ads-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Admin design {current}/6
      </button>
    </div>
  );
}
