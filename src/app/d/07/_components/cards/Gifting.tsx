"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { PHOTOS } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import { EASE, sheet } from "../store";

type GiftSet = { name: string; slugs: [string, string]; line: string };

const sets = (wood: Wood): GiftSet[] => [
  { name: "Box and mala", slugs: ["presentation-box", "japa-mala"], line: "The mala travels in the box it will be kept in." },
  { name: "Box and powder", slugs: ["presentation-box", "heartwood-powder"], line: "A jar of powder with its batch on the label." },
  wood === "white"
    ? { name: "Box and oil", slugs: ["presentation-box", "heartwood-oil"], line: "A sealed vial of oil and its batch record." }
    : { name: "Box and cufflinks", slugs: ["presentation-box", "cufflinks"], line: "A matched pair, cut from one piece." },
];

const TILT = [-4, 1.5, 5];

/** Card 7: gift sets you can add in one go, and the Santalum Circle sign-up. */
export function Gifting() {
  const wood = useWood();

  return (
    <div className="grid min-h-[inherit] gap-8 px-5 pb-[150px] pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[84px] lg:pt-9">
      <div className="flex flex-col lg:col-span-7">
        <h2 className="d1 text-[clamp(3.2rem,min(7.2vw,12vh),7.4rem)]">
          Give something
          <br />
          that remains
        </h2>
        <div className="mt-5 grid gap-4 text-[15.5px] leading-relaxed text-[#3d3731] md:grid-cols-2 md:gap-6">
          <p>
            Every gift leaves in a hinged presentation box with its record and care card inside. Write a note at checkout and we
            keep prices off the packing slip.
          </p>
          <p className="text-[#77706A]">
            For a team or an occasion, put the number of pieces and the date in your gift note. We write back before anything
            is packed.
          </p>
        </div>

        <ul className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto">
          {sets(wood).map((s, i) => (
            <SetCard key={s.name} set={s} wood={wood} tilt={TILT[i]} />
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5">
        <Circle />
      </div>
    </div>
  );
}

function SetCard({ set, wood, tilt }: { set: GiftSet; wood: Wood; tilt: number }) {
  const [box, item] = set.slugs.map((s) => getFamily(s)!);
  const bv = box.variants[wood]!;
  const iv = item.variants[wood]!;
  const [added, setAdded] = useState(false);

  const add = () => {
    bag.add(box.slug, wood);
    bag.add(item.slug, wood);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    sheet.open();
  };

  return (
    <motion.li
      initial={false}
      animate={{ rotate: tilt, y: 0 }}
      whileHover={{ rotate: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative flex-1 rounded-[28px] bg-[#F1E6DC] p-3 shadow-[0_24px_40px_-28px_rgba(27,23,18,0.55)] ring-1 ring-[#1B1712]/6 focus-within:z-10 hover:z-10"
    >
      <div className="relative h-32 md:h-36 lg:h-[clamp(9rem,24vh,14rem)]">
        <div className="absolute left-0 top-0 h-full w-[62%] overflow-hidden rounded-[20px]">
          <Photo p={bv.shots[0].photo} tone={bv.shots[0].tone} sizes="200px" />
        </div>
        <div className="absolute bottom-[-10px] right-0 aspect-square h-[80%] overflow-hidden rounded-full ring-4 ring-[#F1E6DC]">
          <Photo p={iv.shots[0].photo} tone={iv.shots[0].tone} sizes="120px" />
        </div>
      </div>
      <p className="d3 mt-4 text-[20px]">{set.name}</p>
      <p className="mt-1 text-[13px] leading-snug text-[#77706A]">{set.line}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="num text-[15px] font-medium">{formatINR(bv.price + iv.price)}</span>
        <button
          type="button"
          onClick={add}
          className="h-9 rounded-full bg-[#1B1712] px-3.5 text-[13px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-95"
        >
          {added ? "Added" : "Add both"}
        </button>
      </div>
    </motion.li>
  );
}

function Circle() {
  const [done, setDone] = useState<string | null>(null);
  const [keep, setKeep] = useState<"red" | "white" | "both">("both");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setDone(email);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[#EFE9E0] md:rounded-[34px]">
      <div className="relative h-36 shrink-0 md:h-44">
        <Photo p={PHOTOS.diyaHands} sizes="(min-width: 1024px) 36vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-7">
        <h3 className="d2 text-[clamp(2.2rem,3.4vw,3.2rem)]">The Santalum Circle</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#3d3731]">
          Letters from the workshop a few times a year: new batches as they are recorded, Vault numbers as they find their
          owners, and notes on looking after what you hold.
        </p>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-6 rounded-[22px] bg-white p-5"
              role="status"
            >
              <p className="d3 text-[22px]">You are in the Circle.</p>
              <p className="mt-1 text-[14.5px] text-[#77706A]">The next letter goes to {done}.</p>
              <button
                type="button"
                onClick={() => setDone(null)}
                className="mt-3 text-[14px] font-medium underline decoration-[#1B1712]/30 underline-offset-4 transition hover:decoration-[#1B1712]"
              >
                Use another email
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-5 grid gap-4"
            >
              <label className="grid gap-1.5">
                <span className="text-[14px] font-medium">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="s7-input" />
              </label>
              <fieldset>
                <legend className="text-[14px] font-medium">Which wood do you keep?</legend>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-full bg-white p-1">
                  {(["red", "white", "both"] as const).map((k) => (
                    <label
                      key={k}
                      className={`relative grid h-10 cursor-pointer place-items-center rounded-full text-[14px] font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--m-accent)] ${
                        keep === k ? "bg-[#1B1712] text-white" : "text-[#77706A] hover:text-[#1B1712]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="keep"
                        value={k}
                        checked={keep === k}
                        onChange={() => setKeep(k)}
                        className="sr-only"
                      />
                      {k === "both" ? "Both" : k === "red" ? "Red" : "White"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="submit"
                className="h-12 rounded-full bg-[#1B1712] text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
              >
                Join the Circle
              </button>
              <p className="text-[12.5px] text-[#77706A]">Preview: sign-up is not connected yet, so nothing is sent.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
