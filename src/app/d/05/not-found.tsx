import type { IndexItem } from "./_components/content";
import { Missing } from "./_components/Missing";
import { SideIndex } from "./_components/SideIndex";

const SECTIONS: IndexItem[] = [
  { id: "missing", label: "No such entry" },
  { id: "colophon", label: "Colophon" },
];

/** A piece the catalogue does not list (notFound() from an entry page), set inside the Index like any page. */
export default function IndexNotFound() {
  return (
    <div className="x5-page">
      <SideIndex items={SECTIONS} heading="Index" back={{ href: "/d/05/shop", label: "Back to the catalogue" }} />
      <main className="x5-main">
        <Missing />
      </main>
    </div>
  );
}
