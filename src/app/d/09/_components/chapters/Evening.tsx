"use client";

import { useId, useState, type FormEvent } from "react";
import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { RECORD } from "../data";
import { Lines } from "../Lines";
import { Cut, Layer, Scene } from "../Scene";
import { AllPieces } from "./AllPieces";

/** A round seal on the record slip, with its words set around the edge. */
function Seal({ wood }: { wood: Wood }) {
  const id = `d09-seal-${wood}`;
  return (
    <svg viewBox="0 0 100 100" className="size-[84px] shrink-0 -rotate-12 text-[var(--m-accent)]" aria-hidden>
      <defs>
        <path id={id} d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <text fontSize="9.2" letterSpacing="1.4" fill="currentColor" opacity="0.85">
        <textPath href={`#${id}`}>Santalum Maison, example record,</textPath>
      </text>
      <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.14" />
      <circle cx="50" cy="50" r="9" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function Slip({ wood }: { wood: Wood }) {
  const rows = RECORD[wood];
  const batch = rows.find((r) => r.label === "Batch")?.value ?? "";
  return (
    <figure className={`${s.slip} mt-10 max-w-[34rem] px-6 pb-7 pt-7 sm:px-8`}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <figcaption className="text-[13px] text-[var(--muted)]">Example record</figcaption>
          <p className={`${s.display} ${s.tab} mt-2 text-[clamp(2.4rem,9vw,3.4rem)] leading-none`}>{batch}</p>
        </div>
        <Seal wood={wood} />
      </div>
      <dl className="mt-6">
        {rows
          .filter((r) => r.label !== "Batch")
          .map((r) => (
            <div key={r.label} className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-dotted border-[rgb(42_36_32/0.22)] py-2.5">
              <dt className="text-[13px] text-[var(--muted)]">{r.label}</dt>
              <dd className="text-[15px]">{r.value}</dd>
            </div>
          ))}
      </dl>
    </figure>
  );
}

function Circle() {
  const [done, setDone] = useState(false);
  const id = useId();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <section aria-labelledby={`${id}-h`} className="mt-24 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>19:40</p>
        <Lines
          id={`${id}-h`}
          lines={["Stay in", "the Circle"]}
          className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(6vw,6.6rem)]`}
        />
      </div>
      <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
        <p className="max-w-[30rem] text-[17px] leading-[1.7] text-[var(--muted)]">
          The Santalum Circle is a letter from the workshop: new pieces before they are listed, Vault numbers as they are
          released, and notes on the two woods. It comes only when there is something to say.
        </p>
        {done ? (
          <p role="status" className={`${s.display} mt-8 text-[28px] leading-tight`}>
            Thank you. You are in the Circle.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex max-w-[30rem] flex-col gap-4 sm:flex-row sm:items-end">
            <label className={`${s.field} flex-1`}>
              <span className={s.fieldLabel}>Email</span>
              <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
            </label>
            <button type="submit" className={s.btn}>
              Join the Circle
            </button>
          </form>
        )}
        <p className="mt-4 text-[12px] text-[var(--muted)]">Preview: sign-ups are not sent anywhere yet.</p>
      </div>
    </section>
  );
}

/** 19:05. Evening, the record: every piece by the hour, an example batch record, the Santalum Circle. */
export function Evening() {
  return (
    <section id="ch-evening" aria-label="Evening: the record" className="relative">
      <div className="mx-auto max-w-[1600px] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-36">
        <AllPieces />

        <Scene className="mt-28 grid gap-14 lg:mt-32 lg:grid-cols-12 lg:gap-8" label="Know what you hold">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] lg:col-span-5 lg:mx-0 lg:aspect-auto lg:h-[min(78svh,760px)] lg:max-w-none">
            <Layer speed={0.25} className="absolute left-0 top-0 aspect-[3/4] h-[86%]">
              <Cut photo={PHOTOS.gopuram} shape="arch" niche className="size-full" sizes="(min-width: 1024px) 30vw, 80vw" />
            </Layer>
            <Layer speed={0.7} className="absolute bottom-0 right-[2%] aspect-square w-[44%]">
              <Cut photo={PHOTOS.malaHand} shape="circle" className="size-full" sizes="(min-width: 1024px) 18vw, 44vw" />
            </Layer>
          </div>
          <Layer speed={0.12} className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>19:20</p>
            <Lines lines={["Know what", "you hold"]} className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(6vw,6.6rem)]`} />
            <p className="mt-6 max-w-[33rem] text-[17px] leading-[1.7] text-[var(--muted)]">
              If there is evidence, we show it. If there isn&rsquo;t, we don&rsquo;t invent it. This is an example of the record that
              goes with a piece: what it is, which wood, where the wood came from, the batch, who made it and when it was finished.
            </p>
            <W red={<Slip wood="red" />} white={<Slip wood="white" />} />
          </Layer>
        </Scene>

        <Circle />
      </div>
    </section>
  );
}
