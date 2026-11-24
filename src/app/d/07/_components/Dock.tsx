"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { bagTotals, useBag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { IconBag, IconBeads, IconChisel, IconDeck, IconRings } from "./Icons";
import { HOME, scrollToCard, scrollToY, sheet, useSheetOpen } from "./store";

/**
 * The floating dock, bottom-centre. Items swell as the pointer passes (like a desktop dock).
 * The wood toggle lives inside it as a split pill. On phones it is a compact bar above the design switcher.
 */
export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const router = useRouter();
  const lines = useBag();
  const { count } = bagTotals(lines);
  const open = useSheetOpen();

  const go = (id: string) => {
    if (window.location.pathname === HOME) {
      if (id === "home") scrollToY(0);
      else scrollToCard(id);
    } else {
      router.push(id === "home" ? HOME : `${HOME}#${id}`);
    }
  };

  return (
    <nav
      aria-label="Santalum Maison"
      className="pointer-events-none fixed inset-x-0 bottom-[72px] z-[150] flex justify-center px-2 lg:bottom-[14px]"
    >
      <div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex h-[60px] w-full max-w-[440px] items-end justify-between gap-1 rounded-[24px] border border-[#1B1712]/10 bg-[#F8F6F2]/85 px-1.5 pb-[7px] shadow-[0_22px_44px_-22px_rgba(27,23,18,0.55)] backdrop-blur-xl lg:w-auto lg:max-w-none lg:justify-start lg:gap-1.5 lg:rounded-[26px] lg:px-2"
      >
        <DockItem mouseX={mouseX} label="Home" onClick={() => go("home")} icon={<IconDeck />} />
        <DockItem mouseX={mouseX} label="Woods" onClick={() => go("woods")} icon={<IconRings />} />
        <DockItem mouseX={mouseX} label="Pieces" onClick={() => go("pieces")} icon={<IconBeads />} />
        <DockItem mouseX={mouseX} label="Craft" onClick={() => go("craft")} icon={<IconChisel />} />
        <WoodSplit />
        <DockItem
          mouseX={mouseX}
          label={count ? `Bag, ${count} ${count === 1 ? "piece" : "pieces"}` : "Bag"}
          short="Bag"
          onClick={() => sheet.toggle()}
          expanded={open}
          dark
          icon={<IconBag />}
        >
          <AnimatePresence initial={false}>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 24 }}
                className="num absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[var(--m-accent)] px-1 text-[11px] font-semibold text-white ring-2 ring-[#F8F6F2]"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </DockItem>
      </div>
    </nav>
  );
}

function DockItem({
  mouseX,
  label,
  short,
  onClick,
  expanded,
  dark,
  icon,
  children,
}: {
  mouseX: MotionValue<number>;
  label: string;
  short?: string;
  onClick: () => void;
  expanded?: boolean;
  dark?: boolean;
  icon: ReactNode;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useMotionValue(Infinity);
  useMotionValueEvent(mouseX, "change", (x) => {
    const el = ref.current;
    if (!el || !Number.isFinite(x)) {
      dist.set(Infinity);
      return;
    }
    const r = el.getBoundingClientRect();
    dist.set(x - (r.left + r.width / 2));
  });
  const target = useTransform(dist, [-150, 0, 150], [46, 64, 46]);
  const size = useSpring(target, { stiffness: 420, damping: 30, mass: 0.25 });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      style={{ width: size, height: size }}
      className={`group relative flex shrink-0 flex-col items-center justify-center gap-[3px] rounded-[16px] transition-colors duration-300 max-lg:h-[46px]! max-lg:w-[46px]! max-[380px]:w-[42px]! active:scale-95 ${
        dark
          ? "bg-[#1B1712] text-[#F8F6F2] hover:bg-[#2c261f]"
          : "bg-white/70 text-[#1B1712] hover:bg-white"
      } ${expanded ? "ring-2 ring-[var(--m-accent)] ring-offset-2 ring-offset-[#F8F6F2]" : ""}`}
    >
      <span className="grid size-[22px] place-items-center [&>svg]:size-full lg:size-[42%]">{icon}</span>
      <span className="text-[10px] leading-none lg:hidden">{short ?? label}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1B1712] px-2.5 py-1 text-[12px] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
      >
        {short ?? label}
      </span>
      {children}
    </motion.button>
  );
}

const WOODS: { w: Wood; label: string }[] = [
  { w: "red", label: "Red" },
  { w: "white", label: "White" },
];

/** The red / white split pill. */
export function WoodSplit({ big = false, id = "dock" }: { big?: boolean; id?: string }) {
  const wood = useWood();
  return (
    <div
      role="group"
      aria-label="Choose the wood"
      className={`relative flex shrink-0 items-center bg-[#1B1712]/[0.07] p-1 ${
        big ? "h-[52px] rounded-full" : "h-[46px] self-end rounded-[16px] lg:mb-[1px] lg:h-[44px] lg:rounded-full"
      }`}
    >
      {WOODS.map(({ w, label }) => {
        const on = wood === w;
        return (
          <button
            key={w}
            type="button"
            aria-pressed={on}
            aria-label={`${w === "red" ? "Red" : "White"} sandalwood`}
            onClick={() => !on && switchWood(w)}
            className={`relative z-10 flex h-full items-center font-medium transition-colors duration-300 active:scale-95 ${
              big
                ? "gap-1.5 rounded-full px-4 text-[15px]"
                : "w-[42px] flex-col justify-center gap-[3px] rounded-[12px] text-[10px] leading-none lg:w-auto lg:flex-row lg:gap-1.5 lg:rounded-full lg:px-2.5 lg:text-[13px]"
            } ${on ? "text-[#1B1712]" : "text-[#77706A] hover:text-[#1B1712]"}`}
          >
            {on && (
              <motion.span
                layoutId={`s7-wood-${id}`}
                className={`absolute inset-0 -z-10 bg-white shadow-[0_4px_12px_-4px_rgba(27,23,18,0.35)] ${big ? "rounded-full" : "rounded-[12px] lg:rounded-full"}`}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`size-3.5 shrink-0 rounded-full ${w === "red" ? "ring-red" : "ring-white"}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
