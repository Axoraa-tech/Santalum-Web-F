import type { ReactNode } from "react";

/** A section opening on the grid: ink rule, section number, a large title and a short dek. */
export function Head({ n, title, dek, meta, id }: { n: number; title: ReactNode; dek?: ReactNode; meta?: ReactNode; id?: string }) {
  return (
    <header className="x5-head">
      <span className="x5-headN">{n}</span>
      {meta && <p className="x5-headMeta">{meta}</p>}
      <h2 id={id} className="x5-headTitle">
        {title}
      </h2>
      {dek && <div className="x5-headDek">{dek}</div>}
    </header>
  );
}
