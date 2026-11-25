"use client";

import { motion } from "motion/react";
import { useId, useRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { CheckIcon, ChevronIcon } from "../shop/Icons";

/**
 * The Maison's form language: soft filled wells with a label that floats up, a ring of the
 * wood's accent on focus, and the error written underneath in the wood's deep tone.
 */

const WELL =
  "w-full rounded-2xl bg-(--mz-surface) text-[16px] text-(--mz-ink) outline-none ring-1 ring-transparent transition-[box-shadow,background-color] duration-300 ease-out-soft hover:ring-(--mz-ink)/15 focus:bg-(--mz-bg) focus:ring-2 focus:ring-(--mz-accent) aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-(--mz-accent-deep)/55 disabled:opacity-60";

/** The hint gives way to the error: they usually say the same thing, and one line is enough. */
function describe(id: string, error?: string | null, hint?: string) {
  return (error ? `${id}-err` : hint ? `${id}-hint` : undefined) || undefined;
}

function Notes({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  return (
    <>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 px-5 text-[13px] leading-snug text-(--mz-ink-3)">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 px-5 text-[13px] leading-snug text-(--mz-accent-deep)">
          {error}
        </p>
      )}
    </>
  );
}

export function Field({
  label,
  error,
  hint,
  className = "",
  id: given,
  ...input
}: { label: string; error?: string | null; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          {...input}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={describe(id, error, hint)}
          className={`peer h-16 px-5 pt-5 ${WELL}`}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[15px] text-(--mz-ink-3) transition-all duration-200 ease-out-soft peer-focus:top-4 peer-focus:text-[12px] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[12px]"
        >
          {label}
        </label>
      </div>
      <Notes id={id} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  error,
  className = "",
  children,
  id: given,
  ...select
}: { label: string; error?: string | null; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <div className={className}>
      <div className="relative">
        <select
          id={id}
          {...select}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe(id, error)}
          className={`mz-select h-16 cursor-pointer pl-5 pr-12 pt-5 ${WELL}`}
        >
          {children}
        </select>
        <label htmlFor={id} className="pointer-events-none absolute left-5 top-4 text-[12px] text-(--mz-ink-3)">
          {label}
        </label>
        <ChevronIcon className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-(--mz-ink-3)" />
      </div>
      <Notes id={id} error={error} />
    </div>
  );
}

export function TextArea({ label, className = "", id: given, ...area }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <div className={`relative ${className}`}>
      <textarea id={id} {...area} className={`resize-none px-5 pb-4 pt-8 leading-relaxed ${WELL}`} />
      <label htmlFor={id} className="pointer-events-none absolute left-5 top-3 text-[12px] text-(--mz-ink-3)">
        {label}
      </label>
    </div>
  );
}

/** A round check: an empty ring that fills with ink. */
export function Check({ checked, onChange, children, className = "" }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; className?: string }) {
  return (
    <label className={`group/check flex cursor-pointer items-start gap-3 text-[15px] leading-snug ${className}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-[-2px] grid size-6 shrink-0 place-items-center rounded-full border border-(--mz-ink)/25 text-(--mz-bg) transition-colors duration-300 group-hover/check:border-(--mz-ink)/50 peer-checked:border-(--mz-ink) peer-checked:bg-(--mz-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--mz-accent) [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
        <CheckIcon className="transition-opacity" />
      </span>
      <span className="text-(--mz-ink-2)">{children}</span>
    </label>
  );
}

/** On / off, the knob a small slice of the current wood. */
export function Switch({ on, onChange, label, sub, className = "" }: { on: boolean; onChange: (v: boolean) => void; label: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`group/sw flex items-center gap-4 rounded-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent) ${className}`}
    >
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-(--mz-accent)" : "bg-(--mz-surface-2)"}`}>
        <motion.span
          className="absolute left-1 top-1 size-6 overflow-hidden rounded-full bg-(--mz-bg) shadow-[0_1px_4px_rgb(0_0_0/0.2)]"
          initial={false}
          animate={{ x: on ? 24 : 0, rotate: on ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span className="w-red">
            <span className={`ring-red absolute inset-0 transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`} />
          </span>
          <span className="w-white">
            <span className={`ring-white absolute inset-0 transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`} />
          </span>
        </motion.span>
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] text-(--mz-ink)">{label}</span>
        {sub && <span className="mt-1 block text-[13px] text-(--mz-ink-3)">{sub}</span>}
      </span>
    </button>
  );
}

/**
 * Two or more tabs in a pill, the ink highlight sliding between them.
 * Arrow keys move between tabs (roving tabindex).
 */
export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  id,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string }[];
  id: string;
  className?: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex((t) => t.value === value);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    onChange(next.value);
    requestAnimationFrame(() => list.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.value}"]`)?.focus());
  };
  return (
    <div ref={list} role="tablist" onKeyDown={onKey} className={`flex rounded-full bg-(--mz-surface) p-1 ${className}`}>
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            data-tab={t.value}
            id={`${id}-tab-${t.value}`}
            aria-selected={on}
            aria-controls={`${id}-panel-${t.value}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={`relative h-12 flex-1 rounded-full px-4 text-[15px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
              on ? "text-(--mz-bg)" : "text-(--mz-ink-2) hover:text-(--mz-ink)"
            }`}
          >
            {on && <motion.span layoutId={`${id}-tab`} className="absolute inset-0 rounded-full bg-(--mz-ink)" transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} />}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** A choice drawn as a soft card; a ring fills when it is picked. Native radio underneath for keyboard use. */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  disabled,
  children,
  aside,
  className = "",
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`relative flex cursor-pointer items-start gap-4 rounded-[1.75rem] p-5 transition-[background-color,box-shadow] duration-300 ease-out-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--mz-accent) ${
        checked ? "bg-(--mz-bg) shadow-[inset_0_0_0_1.5px_var(--mz-ink)]" : "bg-(--mz-surface) hover:shadow-[inset_0_0_0_1px_var(--mz-line)]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="sr-only" />
      <span className={`relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${checked ? "border-(--mz-ink)" : "border-(--mz-ink)/25"}`}>
        <motion.span
          className="size-3 rounded-full bg-(--mz-accent)"
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />
      </span>
      <span className="min-w-0 flex-1 text-[15px] leading-snug">{children}</span>
      {aside && <span className="shrink-0 text-[15px] tabular-nums">{aside}</span>}
    </label>
  );
}
