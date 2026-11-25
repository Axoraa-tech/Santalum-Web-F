"use client";

import { useEffect, useRef, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { resetContent, saveContent, useContent, useContentEdited, useProducts } from "../../_data/store";
import type { ContentDraft } from "../../_data/types";
import { Box, Btn, F, Head, Seg, say } from "./kit";

export function Content() {
  const [wood, setWood] = useState<Wood>("red");
  const content = useContent(wood);
  const edited = useContentEdited(wood);
  return (
    <div className="a3-page">
      <Head path="~/content" title="content" meta="landing page copy, per wood">
        <Seg value={wood} onChange={setWood} label="Wood" items={[{ id: "red", label: "red sandalwood" }, { id: "white", label: "white sandalwood" }]} />
      </Head>
      <ContentForm key={`${wood}:${JSON.stringify(content)}`} wood={wood} init={content} edited={edited} />
    </div>
  );
}

function ContentForm({ wood, init, edited }: { wood: Wood; init: ContentDraft; edited: boolean }) {
  const products = useProducts().filter((p) => p.wood === wood && p.status !== "archived");
  const [d, setD] = useState(init);
  const set = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(d) !== JSON.stringify(init);
  const save = () => {
    if (!d.heroTitle.trim()) return say("hero title is empty");
    saveContent(wood, d);
    say(`${wood} landing saved`);
  };
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="a3-actions">
        <Btn kind="primary" hint="⌘S" onClick={save} disabled={!dirty}>
          save {wood}
        </Btn>
        {edited && (
          <Btn
            kind="ghost"
            onClick={() => {
              resetContent(wood);
              say("back to the default copy");
            }}
          >
            reset to default
          </Btn>
        )}
        <span className="a3-dim a3-small">{dirty ? "unsaved changes" : edited ? "edited copy is live" : "default copy"}</span>
      </div>
      <div className="a3-ed-grid">
        <div className="a3-ed-col">
          <Box title="hero">
            <div className="a3-form">
              <F label="title" wide>
                <input value={d.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
              </F>
              <F label="sub line" wide>
                <textarea rows={3} value={d.heroSub} onChange={(e) => set("heroSub", e.target.value)} />
              </F>
              <F label="button" wide>
                <input value={d.heroCta} onChange={(e) => set("heroCta", e.target.value)} />
              </F>
            </div>
          </Box>
          <Box title="edition">
            <div className="a3-form">
              <F label="name" wide>
                <input value={d.editionName} onChange={(e) => set("editionName", e.target.value)} />
              </F>
              <F label="size">
                <input className="a3-mono" inputMode="numeric" value={d.editionSize || ""} onChange={(e) => set("editionSize", Number(e.target.value.replace(/\D/g, "")))} />
              </F>
              <F label="product">
                <select value={d.editionSlug} onChange={(e) => set("editionSlug", e.target.value)}>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </F>
              <F label="text" wide>
                <textarea rows={4} value={d.editionText} onChange={(e) => set("editionText", e.target.value)} />
              </F>
            </div>
          </Box>
        </div>
        <Box title={`featured · ${d.featured.length}/8`} meta="order is the order shown" flush>
          <ul className="a3-checks">
            {products.map((p) => {
              const i = d.featured.indexOf(p.slug);
              return (
                <li key={p.slug}>
                  <label>
                    <input
                      type="checkbox"
                      checked={i >= 0}
                      disabled={i < 0 && d.featured.length >= 8}
                      onChange={() => set("featured", i >= 0 ? d.featured.filter((s) => s !== p.slug) : [...d.featured, p.slug])}
                    />
                    <span className="a3-mono a3-dim">{i >= 0 ? String(i + 1).padStart(2, "0") : "--"}</span>
                    <span>{p.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Box>
      </div>
    </>
  );
}
