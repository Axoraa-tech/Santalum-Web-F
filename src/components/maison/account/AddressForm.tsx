"use client";

import { motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { STATES, validate, type Address } from "@/lib/shop/account";
import { Check, Field, SelectField } from "../forms/Field";
import { Pill } from "../Pill";

export type AddressDraft = Omit<Address, "id" | "isDefault">;

const LABELS = ["Home", "Office", "Family"];

type Errors = Partial<Record<"name" | "phone" | "line1" | "city" | "state" | "pin", string | null>>;

/** Indian delivery address, with the label as a small choice of pills. */
export function AddressForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  saveOption,
  defaultOption,
}: {
  initial?: Partial<Address>;
  submitLabel: string;
  onSubmit: (a: AddressDraft, opts: { save: boolean; makeDefault: boolean }) => void;
  onCancel?: () => void;
  /** Show "Save this address" (checkout). */
  saveOption?: boolean;
  /** Show "Use as my default" (account). */
  defaultOption?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [a, setA] = useState<AddressDraft>({
    label: initial?.label ?? "Home",
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    pin: initial?.pin ?? "",
  });
  const [save, setSave] = useState(true);
  const [makeDefault, setMakeDefault] = useState(!!initial?.isDefault);
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof AddressDraft) => (e: { target: { value: string } }) => setA((cur) => ({ ...cur, [k]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errors = {
      name: validate.name(a.name),
      phone: validate.phone(a.phone),
      line1: a.line1.trim().length >= 4 ? null : "Please enter the house number and street.",
      city: a.city.trim().length >= 2 ? null : "Please enter your town or city.",
      state: a.state ? null : "Please choose a state.",
      pin: validate.pin(a.pin),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const clean: AddressDraft = {
      ...a,
      name: a.name.trim(),
      phone: a.phone.replace(/\s/g, ""),
      line1: a.line1.trim(),
      line2: a.line2?.trim() || undefined,
      city: a.city.trim(),
      pin: a.pin.trim(),
    };
    onSubmit(clean, { save, makeDefault });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <fieldset className="pb-2">
        <legend className="mb-3 text-[14px] text-(--mz-ink-2)">Call this address</legend>
        <div className="flex flex-wrap gap-2">
          {LABELS.map((l) => {
            const on = a.label === l;
            return (
              <label
                key={l}
                className={`relative cursor-pointer rounded-full px-5 py-2.5 text-[14px] transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--mz-accent) ${
                  on ? "text-(--mz-bg)" : "bg-(--mz-surface) text-(--mz-ink-2) hover:text-(--mz-ink)"
                }`}
              >
                <input type="radio" name={`label-${id}`} value={l} checked={on} onChange={() => setA((cur) => ({ ...cur, label: l }))} className="sr-only" />
                {on && <motion.span layoutId={`addr-label-${id}`} className="absolute inset-0 rounded-full bg-(--mz-ink)" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
                <span className="relative">{l}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" value={a.name} onChange={set("name")} error={errors.name} />
        <Field label="Mobile" type="tel" name="tel" autoComplete="tel" inputMode="tel" value={a.phone} onChange={set("phone")} error={errors.phone} hint="For the courier, on the day." />
        <Field
          label="House, building and street"
          name="address-line1"
          autoComplete="address-line1"
          value={a.line1}
          onChange={set("line1")}
          error={errors.line1}
          className="sm:col-span-2"
        />
        <Field label="Area or landmark (optional)" name="address-line2" autoComplete="address-line2" value={a.line2 ?? ""} onChange={set("line2")} className="sm:col-span-2" />
        <Field label="Town or city" name="address-level2" autoComplete="address-level2" value={a.city} onChange={set("city")} error={errors.city} />
        <Field
          label="PIN code"
          name="postal-code"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={6}
          value={a.pin}
          onChange={set("pin")}
          error={errors.pin}
        />
        <SelectField label="State" name="address-level1" autoComplete="address-level1" value={a.state} onChange={set("state")} error={errors.state} className="sm:col-span-2">
          <option value="" disabled>
            Choose a state
          </option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
      </div>
      {(saveOption || defaultOption) && (
        <div className="space-y-3 px-1 pt-3">
          {saveOption && (
            <Check checked={save} onChange={setSave}>
              Save this address to my account
            </Check>
          )}
          {defaultOption && (
            <Check checked={makeDefault} onChange={setMakeDefault}>
              Use as my default address
            </Check>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <Pill type="submit" size="lg" className="min-w-[12rem]">
          {submitLabel}
        </Pill>
        {onCancel && (
          <Pill variant="line" size="lg" onClick={onCancel}>
            Cancel
          </Pill>
        )}
      </div>
    </form>
  );
}

/** An address as it reads on a parcel. `masked` hides the street line for public tracking. */
export function AddressLines({ a, masked = false, className = "" }: { a: AddressDraft; masked?: boolean; className?: string }) {
  return (
    <address className={`not-italic leading-relaxed ${className}`}>
      <span className="block text-(--mz-ink)">{a.name}</span>
      {masked ? (
        <span className="block text-(--mz-ink-2)">Street address hidden for privacy</span>
      ) : (
        <>
          <span className="block text-(--mz-ink-2)">{a.line1}</span>
          {a.line2 && <span className="block text-(--mz-ink-2)">{a.line2}</span>}
        </>
      )}
      <span className="block text-(--mz-ink-2)">
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span className="block tabular-nums text-(--mz-ink-3)">{a.phone}</span>}
    </address>
  );
}
