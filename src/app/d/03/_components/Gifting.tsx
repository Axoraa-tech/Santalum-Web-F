"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, priceLabel, type CategoryId } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { ui } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

type Copy = {
  h: [string, string];
  big: PhotoRef;
  small: PhotoRef;
  first: { slug: string; title: string; text: string; see: string };
  note: string;
  teams: { slug: string; title: string; text: string };
  qty: string[];
  category: CategoryId;
  shop: string;
};

const COPY: Record<Wood, Copy> = {
  red: {
    h: ["A gift", "with weight"],
    big: PHOTOS.boxCarved,
    small: PHOTOS.boxRed,
    first: {
      slug: "r-presentation-box",
      title: "The presentation box",
      text: "Dovetailed, hinged in brass and lined in raw cotton, with a drawer for the batch record. Choose it empty, or ask us to fill it.",
      see: "See the box",
    },
    note: "Add a note at checkout. It travels with the piece in your words; the price does not travel at all.",
    teams: {
      slug: "r-desk-set",
      title: "For teams: the desk set",
      text: "A pen, a pair of coasters and a key fob in one box, with room for a company card. From ten sets; engraving on request.",
    },
    qty: ["10 to 25 sets", "25 to 50 sets", "50 to 100 sets", "More than 100 sets"],
    category: "gifting",
    shop: "All red sandalwood gifts",
  },
  white: {
    h: ["A gift that", "fills the room"],
    big: PHOTOS.giftLinen,
    small: PHOTOS.diyaHands,
    first: {
      slug: "w-morning-ritual",
      title: "The morning ritual",
      text: "A chandan stone and stick, five millilitres of heartwood oil and a tin of lamp wicks, wrapped in linen. The first ten minutes of the day.",
      see: "See the ritual box",
    },
    note: "Add a note at checkout for the puja, the wedding or the new house. It travels in your words; the price does not.",
    teams: {
      slug: "w-wedding-tray",
      title: "For weddings: the tray",
      text: "Attar, chandan, a wrist mala and a brass lamp on a turned tray, packed by hand for each family. From ten trays, with names on the cards.",
    },
    qty: ["10 to 25 trays", "25 to 50 trays", "50 to 100 trays", "More than 100 trays"],
    category: "w-gifting",
    shop: "All white sandalwood gifts",
  },
};

/** Gifting: two hanging pieces of photography and three ways to give, strung on the page thread. */
export function Gifting() {
  return (
    <section id="gifting" aria-labelledby="gift-h" className="relative z-[1] px-4 py-24 md:px-10 md:py-28">
      <W red={<Gifts wood="red" />} white={<Gifts wood="white" />} />
    </section>
  );
}

function Gifts({ wood }: { wood: Wood }) {
  const t = COPY[wood];
  const g = CONTENT[wood].gifting;
  const first = getProduct(t.first.slug)!;
  const teams = getProduct(t.teams.slug)!;
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<{ name: string; email: string; qty: string } | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setSent({ name: String(d.get("name") ?? "").split(" ")[0], email: String(d.get("email") ?? ""), qty: String(d.get("qty") ?? "") });
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-12 md:gap-10">
      {/* two pieces hanging from the thread */}
      <div className="relative md:col-span-6">
        <div className="relative mx-auto w-[86%] md:mx-0 md:w-[78%]">
          <span data-knot className="s3-knot absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-1/2" aria-hidden />
          <div className="s3-hang-thread h-14" aria-hidden />
          <span className="s3-cap" aria-hidden />
          <div className="relative -mt-px aspect-square overflow-hidden rounded-full bg-(--warm)">
            <Photo p={t.big} sizes="(min-width: 768px) 40vw, 86vw" />
          </div>
          <div className="absolute -bottom-[38%] right-[-6%] w-[46%] md:-bottom-[30%] md:right-[-14%]">
            <div className="s3-hang-thread h-10" aria-hidden />
            <div className="relative aspect-square overflow-hidden rounded-full border-[6px] border-(--linen) bg-(--warm)">
              <Photo p={t.small} sizes="(min-width: 768px) 18vw, 40vw" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 md:col-span-6 md:pt-0">
        <div className="bg-(--linen)">
          <h2 id={wood === "red" ? "gift-h" : "gift-h-w"} className="s3-h2">
            {t.h[0]}
            <br />
            {t.h[1]}
          </h2>
          <p className="s3-lede mt-6 max-w-[32rem]">{g.text}</p>
        </div>

        <ol className="relative mt-12">
          <Offer title={t.first.title}>
            <p>{t.first.text}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="s3-serif text-[24px]">{priceLabel(first)}</span>
              <button type="button" className="s3-link text-[15px]" onClick={() => ui.openProduct(first.slug)}>
                {t.first.see}
              </button>
            </div>
          </Offer>
          <Offer title="A message in your words">
            <p>{t.note}</p>
          </Offer>
          <Offer title={t.teams.title} last>
            <p>{t.teams.text}</p>
            <p className="mt-2 text-[15px] text-(--muted)">{priceLabel(teams)} each</p>
            <AnimatePresence initial={false} mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-[22px] bg-(--warm) p-5"
                  role="status"
                >
                  <p className="s3-serif text-[22px] leading-tight">Thank you{sent.name ? `, ${sent.name}` : ""}.</p>
                  <p className="mt-2 text-[15px] text-(--ink)/80">
                    We will write to {sent.email} about {sent.qty.toLowerCase()}. This is a preview, so nothing was sent yet.
                  </p>
                </motion.div>
              ) : open ? (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 grid gap-4 rounded-[22px] bg-(--warm) p-5 sm:grid-cols-2">
                    <label className="s3-field">
                      <span>Your name</span>
                      <input name="name" required autoComplete="name" className="s3-input" />
                    </label>
                    <label className="s3-field">
                      <span>Email</span>
                      <input name="email" type="email" required autoComplete="email" className="s3-input" />
                    </label>
                    <label className="s3-field">
                      <span>{wood === "red" ? "Organisation (optional)" : "Family or organisation (optional)"}</span>
                      <input name="org" autoComplete="organization" className="s3-input" />
                    </label>
                    <label className="s3-field">
                      <span>How many</span>
                      <select name="qty" required className="s3-input" defaultValue={t.qty[0]}>
                        {t.qty.map((q) => (
                          <option key={q}>{q}</option>
                        ))}
                      </select>
                    </label>
                    <label className="s3-field sm:col-span-2">
                      <span>{wood === "red" ? "When you need them, and anything else" : "The date of the occasion, and anything else"}</span>
                      <textarea name="notes" rows={3} className="s3-input" />
                    </label>
                    <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                      <button type="submit" className="s3-btn s3-btn-dark">
                        <span className="s3-bead s3-btn-bead" aria-hidden />
                        Send the enquiry
                      </button>
                      <span className="text-[13px] text-(--muted)">Preview: this form is not connected yet.</span>
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="cta" exit={{ opacity: 0 }}>
                  <button type="button" className="s3-btn s3-btn-line mt-5" onClick={() => setOpen(true)} aria-expanded={open}>
                    {wood === "red" ? "Start a corporate enquiry" : "Start a wedding enquiry"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Offer>
        </ol>
        <Link href={`/d/03/shop?c=${t.category}`} className="s3-shoplink relative z-[1] mt-10 bg-(--linen)">
          {t.shop}
          <span className="s3-shoplink-thread" aria-hidden>
            <span className="s3-bead" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function Offer({ title, children, last = false }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <li className={`relative grid grid-cols-[2.25rem_1fr] ${last ? "" : "pb-9"}`}>
      <span data-knot className="s3-knot relative mt-[10px] h-[18px] w-[18px]" aria-hidden />
      <div className="bg-(--linen) text-[16px] leading-[1.65] text-(--ink)/80">
        <h3 className="s3-serif text-[clamp(1.6rem,2.3vw,2.2rem)] leading-[1.1] text-(--ink)">{title}</h3>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  );
}
