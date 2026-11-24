"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx, WOOD_SHORT } from "./data";
import { PieceTile } from "./PieceTile";
import { views } from "./store";
import { Corner, IconArrow } from "./ui";

const pad = (n: number) => String(n).padStart(2, "0");

/** The 2011 Vault, gifting and the Santalum Circle. */
export function KeepBento() {
  const wood = useWood();
  const cuff = getFamily("vault-cuff")!;
  const box = getFamily("presentation-box")!;
  return (
    <section aria-label="The 2011 Vault, gifting and the Santalum Circle" className={cx(s.bento, s.keep)}>
      <Vault />
      <PieceTile family={cuff} wood={wood} id="keep-cf" style={{ gridArea: "cf" }} className="min-h-[320px]" sizes="(min-width:1024px) 40vw, 100vw" label="Edition of 21" />
      <Gift />
      <PieceTile family={box} wood={wood} id="keep-bx" style={{ gridArea: "bx" }} className="min-h-[220px]" sizes="(min-width:1024px) 25vw, 50vw" />
      <Corporate />
      <Circle />
    </section>
  );
}

function Vault() {
  const wood = useWood();
  const [n, setN] = useState<number | null>(null);
  const price = getFamily("vault-cuff")!.variants[wood]!.price;
  const openCuff = () => views.open({ kind: "product", slug: "vault-cuff", from: "keep-cf", img: true });

  return (
    <motion.div
      layoutId="keep-vt"
      id="vault"
      style={{ gridArea: "vt", borderRadius: 28 }}
      className={cx(s.tile, s.t2, s.section)}
    >
      <div className="grid h-full gap-8 p-6 sm:p-8 @min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
      <div className="flex flex-col">
        <h2 className={cx(s.display, "max-w-[8ch] text-[clamp(40px,8.4cqw,88px)]")}>The 2011 Vault</h2>
        <p className={cx(s.muted, "mt-5 max-w-[34ch] text-[17px] leading-[1.5]")}>
          Twenty-one numbered cuffs, turned from aged heartwood sourced in 2011. Each is made to your measurement and entered in our registry.
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-7">
          <button type="button" className={s.btn} onClick={openCuff}>
            See the cuff, {formatINR(price)}
          </button>
          <button type="button" className={cx(s.ghost, s.onWhite)} onClick={() => views.open({ kind: "story", id: "vault", from: "keep-vt", img: false })}>
            The story
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-7 gap-1.5" onMouseLeave={() => setN(null)}>
          {Array.from({ length: 21 }, (_, i) => {
            const k = i + 1;
            const on = n === k;
            return (
              <button
                key={k}
                type="button"
                onMouseEnter={() => setN(k)}
                onFocus={() => setN(k)}
                onBlur={() => setN(null)}
                onClick={openCuff}
                aria-label={`Cuff ${k} of 21`}
                className={cx(
                  s.mono,
                  "grid aspect-square w-full place-items-center rounded-full text-[10px] transition-[background-color,color,scale,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-90",
                  on ? "scale-110 bg-[#141414] text-white" : "bg-white text-[#141414]/40 shadow-[inset_0_0_0_1px_rgba(20,20,20,0.06)] hover:text-[#141414]",
                )}
              >
                {pad(k)}
              </button>
            );
          })}
        </div>
        <div className="min-h-[92px] w-full rounded-[20px] bg-white p-4" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={n ?? 0} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {n ? (
                <div className="flex items-center gap-4">
                  <p className={cx(s.monoWide, "text-[40px] leading-none text-accent")}>{pad(n)}</p>
                  <div>
                    <p className="text-[15px] font-medium">Cuff {n} of 21</p>
                    <p className={cx(s.mono, s.muted, "mt-0.5 text-[10.5px] leading-[1.5]")}>
                      Aged {WOOD_SHORT[wood].toLowerCase()}, sourced 2011
                      <br />
                      Made to measure, {formatINR(price)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <p className={cx(s.monoWide, "text-[40px] leading-none")}>21</p>
                  <p className={cx(s.muted, "text-[14px] leading-[1.4]")}>
                    Numbered cuffs. When the twenty-first is made, the edition closes.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

function Gift() {
  const wood = useWood();
  const photo = wood === "red" ? PHOTOS.giftLinen : PHOTOS.boxes;
  return (
    <motion.div
      layoutId="keep-gf"
      id="gifting"
      style={{ gridArea: "gf", borderRadius: 28 }}
      className={cx(s.tile, s.t2, s.section, s.opener, "min-h-[340px]")}
    >
      <motion.div layoutId="keep-gf-img" className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
        <div className={s.zoom}>
          <Photo p={photo} sizes="(min-width:1024px) 42vw, 100vw" />
        </div>
      </motion.div>
      <Corner icon="expand" />
      <button
        type="button"
        className={s.hit}
        onClick={() => views.open({ kind: "story", id: "gifting", from: "keep-gf", img: true })}
        aria-label="Read about gifting"
      />
      <div className="pointer-events-none absolute bottom-2 left-2 z-[3] w-[min(420px,calc(100%-16px))] rounded-[20px] bg-white p-5">
        <h2 className="text-[clamp(24px,6cqw,36px)] font-medium leading-none tracking-[-0.04em]">Give something that remains</h2>
        <p className={cx(s.muted, "mt-3 text-[15px] leading-[1.45]")}>Packed in raw cotton, linen or a sandalwood box, with a written message if you want one.</p>
      </div>
    </motion.div>
  );
}

function Corporate() {
  return (
    <motion.div layoutId="keep-co" style={{ gridArea: "co", borderRadius: 28 }} className={cx(s.tile, s.dark, s.opener, "group flex items-center justify-between gap-3 p-5")}>
      <div className="min-w-0">
        <p className="text-[17px] font-medium leading-tight tracking-[-0.02em]">Corporate gifting</p>
        <p className="mt-1 text-[13px] leading-snug text-white/60">Tell us how many, and by when.</p>
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#141414] transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
        <IconArrow size={16} />
      </span>
      <button
        type="button"
        className={s.hit}
        onClick={() => views.open({ kind: "story", id: "gifting", from: "keep-co", img: false })}
        aria-label="Corporate gifting enquiry"
      />
    </motion.div>
  );
}

function Circle() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <div id="circle" style={{ gridArea: "ci" }} className={cx(s.tile, s.tint, s.section, "flex min-h-[340px] flex-col p-6 sm:p-7")}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        {Array.from({ length: 21 }, (_, i) => {
          const a = (i / 21) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} cx={Math.round((28 + Math.cos(a) * 22) * 100) / 100} cy={Math.round((28 + Math.sin(a) * 22) * 100) / 100} r={2.4} fill="var(--m-accent)" opacity={0.35 + (i % 3) * 0.25} />;
        })}
        <circle cx="28" cy="28" r="6" fill="#141414" />
      </svg>
      <h2 className={cx(s.display, "mt-5 text-[clamp(30px,8cqw,48px)]")}>The Santalum Circle</h2>
      <p className="mt-3 max-w-[38ch] text-[15px] leading-[1.5]">
        Letters from the workshop, a few times a year: new pieces, notes on the wood, and news of the Vault.
      </p>
      <div className="mt-auto pt-5">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] bg-white p-4">
              <p className="text-[16px] font-medium">You are in the Circle.</p>
              <p className={cx(s.muted, "mt-1 break-words text-[13px] leading-[1.45]")}>
                The next letter goes to {email}. Preview: sign-ups are not stored yet.
              </p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -8 }}>
              <label htmlFor="b6-circle" className={s.label}>
                Email address
              </label>
              <div className="flex gap-2">
                <input
                  id="b6-circle"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cx(s.field, s.fieldWhite, "min-w-0")}
                  placeholder="you@example.com"
                />
                <button type="submit" className={cx(s.btn, "shrink-0")}>
                  Join
                </button>
              </div>
              <p className={cx(s.muted, "mt-2 text-[12.5px]")}>A few letters a year. Leave whenever you like.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
