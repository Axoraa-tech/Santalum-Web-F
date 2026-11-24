"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import { ui } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;
const QTY = ["10 to 25", "25 to 50", "50 to 100", "More than 100"];

/** Gifting: two hanging pieces of photography and three ways to give, strung on the page thread. */
export function Gifting() {
  const wood = useWood();
  const box = getFamily("presentation-box")!;
  const boxV = box.variants[wood]!;
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<{ name: string; email: string; qty: string } | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setSent({ name: String(d.get("name") ?? "").split(" ")[0], email: String(d.get("email") ?? ""), qty: String(d.get("qty") ?? "") });
  };

  return (
    <section id="gifting" aria-labelledby="gift-h" className="relative z-[1] px-4 py-24 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-12 md:gap-10">
        {/* two pieces hanging from the thread */}
        <div className="relative md:col-span-6">
          <div className="relative mx-auto w-[86%] md:mx-0 md:w-[78%]">
            <span data-knot className="s3-knot absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-1/2" aria-hidden />
            <div className="s3-hang-thread h-14" aria-hidden />
            <span className="s3-cap" aria-hidden />
            <div className="relative -mt-px aspect-square overflow-hidden rounded-full bg-(--warm)">
              <Photo p={wood === "red" ? PHOTOS.boxCarved : PHOTOS.giftLinen} sizes="(min-width: 768px) 40vw, 86vw" />
            </div>
            <div className="absolute -bottom-[38%] right-[-6%] w-[46%] md:-bottom-[30%] md:right-[-14%]">
              <div className="s3-hang-thread h-10" aria-hidden />
              <div className="relative aspect-square overflow-hidden rounded-full border-[6px] border-(--linen) bg-(--warm)">
                <Photo p={wood === "red" ? PHOTOS.boxRed : PHOTOS.boxes} sizes="(min-width: 768px) 18vw, 40vw" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-24 md:col-span-6 md:pt-0">
          <div className="bg-(--linen)">
            <h2 id="gift-h" className="s3-h2">
              Give something
              <br />
              that remains
            </h2>
            <p className="s3-lede mt-6 max-w-[32rem]">
              A piece of heartwood outlasts the occasion it was given for. We box it, record it, and send it ready to hand over.
            </p>
          </div>

          <ol className="relative mt-12">
            <Offer title="The presentation box">
              <p>
                Dovetailed, hand-finished and lined in raw cotton, with a drawer for the certificate. Choose it empty, or filled with a
                mala, powder or oil.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="s3-serif text-[24px]">{formatINR(boxV.price)}</span>
                <button type="button" className="s3-link text-[15px]" onClick={() => ui.openProduct("presentation-box")}>
                  See the box
                </button>
              </div>
            </Offer>
            <Offer title="A message in your words">
              <p>Add a gift note at checkout. It travels with the piece; the price does not.</p>
            </Offer>
            <Offer title="For teams and occasions" last>
              <p>
                Weddings, festivals, company milestones. We put together sets from the collection, each boxed with its record. Tell us
                how many and when.
              </p>
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
                      We will write to {sent.email} about {sent.qty.toLowerCase()} pieces. This is a preview, so nothing was sent yet.
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
                        <span>Organisation (optional)</span>
                        <input name="org" autoComplete="organization" className="s3-input" />
                      </label>
                      <label className="s3-field">
                        <span>How many pieces</span>
                        <select name="qty" required className="s3-input" defaultValue={QTY[0]}>
                          {QTY.map((q) => (
                            <option key={q}>{q}</option>
                          ))}
                        </select>
                      </label>
                      <label className="s3-field sm:col-span-2">
                        <span>When you need them, and anything else</span>
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
                      Start a gifting enquiry
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Offer>
          </ol>
        </div>
      </div>
    </section>
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
