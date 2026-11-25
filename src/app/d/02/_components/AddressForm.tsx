"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { STATES, validate, type Address } from "@/lib/shop/account";
import { s } from "./cls";
import { Station, TurnMark } from "./Station";
import { ArrowIcon, CheckIcon, Toggle } from "./ui";

export type AddressDraft = Omit<Address, "id" | "isDefault">;
type Key = "name" | "phone" | "line1" | "city" | "state" | "pin";
const LABELS = ["Home", "Office", "Family"];

/** The address in three stations, in the order a courier reads a parcel: who, which street, which town. */
const GROUPS: { label: string; title: string; keys: Key[] }[] = [
  { label: "Who", title: "Who receives it", keys: ["name", "phone"] },
  { label: "Street", title: "The street", keys: ["line1"] },
  { label: "Town", title: "Town, PIN and state", keys: ["city", "pin", "state"] },
];

/* the dial: three arcs, one per station, around a hub that writes the parcel's town and PIN as you type */
const R = 70;
const pt = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return [90 + r * Math.sin(a), 90 - r * Math.cos(a)] as const;
};
function arc(from: number, to: number) {
  const [x1, y1] = pt(from);
  const [x2, y2] = pt(to);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function AddressDial({ done, city, pin, onPick }: { done: boolean[]; city: string; pin: string; onPick: (i: number) => void }) {
  const n = done.filter(Boolean).length;
  const next = done.findIndex((d) => !d);
  const digits = pin.padEnd(6, " ").slice(0, 6).split("");
  return (
    <div className="relative mx-auto size-[156px] shrink-0 md:size-[168px]">
      <svg viewBox="0 0 180 180" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="90" cy="90" r="86" fill="var(--o-card)" stroke="var(--o-line)" />
        {GROUPS.map((g, i) => {
          const a0 = i * 120 + 14;
          const a1 = (i + 1) * 120 - 14;
          return (
            <g key={g.label}>
              <path d={arc(a0, a1)} fill="none" stroke="var(--o-line)" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
              <path
                d={arc(a0, a1)}
                fill="none"
                stroke="var(--m-accent)"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={done[i] ? 0 : 1}
                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </g>
          );
        })}
      </svg>
      {GROUPS.map((g, i) => {
        const [x, y] = pt(i * 120);
        const on = i === next;
        return (
          <button
            key={g.label}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`${g.title}${done[i] ? ", complete" : ""}`}
            className={`absolute grid size-[26px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[12px] font-bold tabular-nums transition-[background-color,transform] duration-500 hover:scale-110 ${
              done[i] ? "bg-[var(--o-ink)] text-white" : on ? "bg-[var(--m-accent)] text-white" : "border border-[var(--o-line)] bg-[var(--o-card)] text-[var(--o-muted)]"
            }`}
            style={{ left: `${(x / 180) * 100}%`, top: `${(y / 180) * 100}%` }}
          >
            {done[i] ? <CheckIcon className="size-3" /> : i + 1}
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-[22%] grid place-items-center text-center" aria-hidden>
        <div className="min-w-0">
          <p className="text-[11px] tabular-nums text-[var(--o-muted)]">{n === 3 ? "Ready to send" : `${n} of 3`}</p>
          <p className={`${s.syne} max-w-[84px] truncate text-[14px] font-bold leading-tight`}>{city.trim() || (next >= 0 ? GROUPS[next].label : "")}</p>
          <p className="mt-1 flex justify-center gap-[2px]">
            {digits.map((d, i) => (
              <span key={i} className={`grid h-[15px] w-[10px] place-items-center rounded-[3px] text-[10px] font-bold tabular-nums ${d.trim() ? "bg-[var(--o-ink)] text-white" : "bg-[var(--o-floor)]"}`}>
                {d.trim()}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

/** One station of the address: its number on the rail, its title, its fields. */
function Group({ i, done, children }: { i: number; done: boolean; children: ReactNode }) {
  const g = GROUPS[i];
  return (
    <fieldset className="relative pl-11">
      <span aria-hidden className={`absolute left-0 top-0 grid size-8 place-items-center rounded-full text-[13px] font-bold tabular-nums transition-colors duration-500 ${done ? "bg-[var(--o-ink)] text-white" : "border border-[var(--o-line)] bg-[var(--o-card)] text-[var(--o-muted)]"}`}>
        {done ? <CheckIcon className="size-3.5" /> : i + 1}
      </span>
      {i < GROUPS.length - 1 && <span aria-hidden className="absolute bottom-[-22px] left-[15.5px] top-10 border-l border-dashed border-[var(--o-line)]" />}
      <legend className={`${s.syne} flex h-8 items-center text-[16px] font-bold tracking-[-0.01em]`}>{g.title}</legend>
      <div className="mt-3 grid gap-3">{children}</div>
    </fieldset>
  );
}

/** An Indian delivery address, checked with the shared validators. Used at checkout and in the account. */
export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  saveOption,
  defaultOption,
}: {
  initial?: Partial<AddressDraft> & { isDefault?: boolean };
  onSubmit: (a: AddressDraft, opts: { save: boolean; makeDefault: boolean }) => void;
  onCancel?: () => void;
  submitLabel: string;
  /** Checkout: offer "Save this address". */
  saveOption?: boolean;
  /** Account: offer "Make this my default". */
  defaultOption?: boolean;
}) {
  const [f, setF] = useState<AddressDraft>({
    label: initial?.label ?? "Home",
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    pin: initial?.pin ?? "",
  });
  const gid = useId();
  const [save, setSave] = useState(true);
  const [makeDefault, setMakeDefault] = useState(!!initial?.isDefault);
  const [errors, setErrors] = useState<Partial<Record<Key, string | null>>>({});
  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    line1: useRef<HTMLInputElement>(null),
    city: useRef<HTMLInputElement>(null),
    state: useRef<HTMLSelectElement>(null),
    pin: useRef<HTMLInputElement>(null),
  };
  const set = <K extends keyof AddressDraft>(k: K, v: AddressDraft[K]) => {
    setF((o) => ({ ...o, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: null }));
  };

  const check: Record<Key, string | null> = {
    name: validate.name(f.name),
    phone: validate.phone(f.phone),
    line1: f.line1.trim().length >= 4 ? null : "Please enter the house, building and street.",
    city: f.city.trim().length >= 2 ? null : "Please enter the city.",
    state: f.state ? null : "Please choose the state.",
    pin: validate.pin(f.pin),
  };
  const ok = (k: Key) => !check[k];
  const done = GROUPS.map((g) => g.keys.every(ok));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErrors(check);
    const first = (["name", "phone", "line1", "city", "pin", "state"] as const).find((k) => check[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    onSubmit({ ...f, name: f.name.trim(), line1: f.line1.trim(), line2: f.line2?.trim() || undefined, city: f.city.trim(), pin: f.pin.trim() }, { save, makeDefault });
  };

  const pick = (i: number) => {
    const k = GROUPS[i].keys.find((x) => !ok(x)) ?? GROUPS[i].keys[0];
    refs[k].current?.focus();
  };

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-8 md:grid-cols-[168px_minmax(0,1fr)] md:gap-10">
      <div className="md:sticky md:top-28">
        <AddressDial done={done} city={f.city} pin={f.pin} onPick={pick} />
      </div>

      <div className="min-w-0 space-y-7">
        <Group i={0} done={done[0]}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Station label="Full name" glyph="Aa" done={ok("name")} error={errors.name}>
              {(a) => <input ref={refs.name} id={a.id} autoComplete="name" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={f.name} onChange={(e) => set("name", e.target.value)} className={s.stIn} />}
            </Station>
            <Station label="Mobile number" glyph="+91" done={ok("phone")} error={errors.phone}>
              {(a) => (
                <input
                  ref={refs.phone}
                  id={a.id}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  aria-describedby={a.describedBy}
                  aria-invalid={a.invalid}
                  value={f.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="10 digits"
                  className={`${s.stIn} tabular-nums`}
                />
              )}
            </Station>
          </div>
        </Group>

        <Group i={1} done={done[1]}>
          <Station label="House, building and street" glyph="1" done={ok("line1")} error={errors.line1}>
            {(a) => (
              <input ref={refs.line1} id={a.id} autoComplete="address-line1" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={f.line1} onChange={(e) => set("line1", e.target.value)} className={s.stIn} />
            )}
          </Station>
          <Station label="Area or landmark (optional)" glyph="2" done={!!f.line2?.trim()}>
            {(a) => <input id={a.id} autoComplete="address-line2" aria-describedby={a.describedBy} value={f.line2 ?? ""} onChange={(e) => set("line2", e.target.value)} className={s.stIn} />}
          </Station>
        </Group>

        <Group i={2} done={done[2]}>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,190px)]">
            <Station label="City" glyph="C" done={ok("city")} error={errors.city}>
              {(a) => <input ref={refs.city} id={a.id} autoComplete="address-level2" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={f.city} onChange={(e) => set("city", e.target.value)} className={s.stIn} />}
            </Station>
            <Station label="PIN code" glyph="#" done={ok("pin")} error={errors.pin}>
              {(a) => (
                <input
                  ref={refs.pin}
                  id={a.id}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  aria-describedby={a.describedBy}
                  aria-invalid={a.invalid}
                  value={f.pin}
                  onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))}
                  placeholder="6 digits"
                  className={`${s.stIn} tabular-nums tracking-[0.08em]`}
                />
              )}
            </Station>
          </div>
          <Station label="State or union territory" glyph="S" done={ok("state")} error={errors.state} trailing={<TurnMark />}>
            {(a) => (
              <select
                ref={refs.state}
                id={a.id}
                autoComplete="address-level1"
                aria-describedby={a.describedBy}
                aria-invalid={a.invalid}
                value={f.state}
                required
                onChange={(e) => set("state", e.target.value)}
                className={s.stIn}
              >
                <option value="" disabled>
                  Turn to choose
                </option>
                {STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}
          </Station>
        </Group>

        {/* what to call it: three small discs, like the ranges in the shop */}
        <fieldset className="pl-11">
          <legend className="mb-3 text-[14px] font-semibold">Call it</legend>
          <div className="flex flex-wrap gap-3">
            {LABELS.map((l) => {
              const on = f.label === l;
              return (
                <label
                  key={l}
                  className={`${s.syne} grid size-[68px] cursor-pointer place-items-center rounded-full border text-[13px] font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--m-accent)] ${
                    on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white shadow-[0_0_0_3px_var(--o-bg),0_0_0_5px_var(--m-accent)]" : "border-[var(--o-line)] bg-[var(--o-card)] hover:border-[var(--o-ink)]"
                  }`}
                >
                  <input type="radio" name={gid} className="sr-only" checked={on} onChange={() => set("label", l)} />
                  {l}
                </label>
              );
            })}
          </div>
        </fieldset>

        {(saveOption || defaultOption) && (
          <div className="space-y-3 pl-11">
            {saveOption && (
              <Toggle checked={save} onChange={setSave}>
                Save this address to my account
              </Toggle>
            )}
            {defaultOption && (
              <Toggle checked={makeDefault} onChange={setMakeDefault}>
                Make this my default address
              </Toggle>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pl-11">
          {onCancel && (
            <button type="button" onClick={onCancel} className="h-14 rounded-full border border-[var(--o-line)] px-6 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]">
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="group flex h-14 flex-1 items-center justify-between gap-6 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99] sm:flex-none"
          >
            {submitLabel}
            <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
