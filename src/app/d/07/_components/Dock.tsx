"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, useTransition, type ReactNode, type Ref } from "react";
import { useUser } from "@/lib/shop/account";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { useHydrated } from "@/lib/shop/store";
import { setWoodQuietly, useWood, type Wood } from "@/lib/wood";
import { IconBag, IconBeads, IconChisel, IconDeck, IconRings, IconShop, IconTrack, IconUser } from "./Icons";
import { ACCOUNT, chooseWood, firstName, HOME, scrollToCard, scrollToY, sheet, SHOP, takePendingWood, TRACK, useSheetOpen } from "./store";

const MotionLink = motion.create(Link);

/**
 * The floating dock, bottom-centre. Items swell as the pointer passes (like a desktop dock).
 * Left: the cards of the home deck. Middle: the shop, tracking and the account. Then the wood toggle and the bag.
 * On phones it is a compact bar above the design switcher with the shop group only.
 */
export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const user = useUser();
  const { count } = bagSummary(useBag());
  const open = useSheetOpen();
  const onHome = pathname === HOME;

  // A wood chosen on a product page waits for the next page; it is applied in the commit that shows that page.
  useLayoutEffect(() => {
    const w = takePendingWood();
    if (w) setWoodQuietly(w);
  }, [pathname]);

  const go = (id: string) => {
    if (onHome) {
      if (id === "home") scrollToY(0);
      else scrollToCard(id);
    } else {
      router.push(id === "home" ? HOME : `${HOME}#${id}`);
    }
  };

  const who = hydrated && user ? firstName(user.name) : "Sign in";

  return (
    <nav
      aria-label="Santalum Maison"
      className="pointer-events-none fixed inset-x-0 bottom-[72px] z-[150] flex justify-center px-2 lg:bottom-[14px]"
    >
      <div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex h-[60px] w-full max-w-[440px] items-end justify-between gap-1 rounded-[24px] border border-(--s7-ink)/10 bg-(--s7-page)/85 px-1.5 pb-[7px] shadow-[0_22px_44px_-22px_rgba(27,23,18,0.55)] backdrop-blur-xl lg:w-auto lg:max-w-none lg:justify-start lg:gap-1.5 lg:rounded-[26px] lg:px-2"
      >
        <DockItem mouseX={mouseX} label="Home" onClick={() => go("home")} icon={<IconDeck />} active={onHome} />
        <DockItem mouseX={mouseX} label="Woods" onClick={() => go("woods")} icon={<IconRings />} desktop />
        <DockItem mouseX={mouseX} label="Pieces" onClick={() => go("pieces")} icon={<IconBeads />} desktop />
        <DockItem mouseX={mouseX} label="Craft" onClick={() => go("craft")} icon={<IconChisel />} desktop />
        <span aria-hidden className="mx-0.5 mb-2 hidden h-8 w-px self-end bg-(--s7-ink)/15 lg:block" />
        <DockItem
          mouseX={mouseX}
          label="Shop"
          href={SHOP}
          icon={<IconShop />}
          active={pathname.startsWith(SHOP) || pathname.startsWith(`${HOME}/p/`)}
        />
        <DockItem mouseX={mouseX} label="Track order" short="Track" href={TRACK} icon={<IconTrack />} active={pathname.startsWith(TRACK)} />
        <DockItem
          mouseX={mouseX}
          label={hydrated && user ? `Your account, ${user.name}` : "Sign in"}
          short={who}
          href={ACCOUNT}
          icon={<IconUser />}
          active={pathname.startsWith(ACCOUNT)}
          signedIn={hydrated && !!user}
        />
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
                className="num absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-(--s7-accent) px-1 text-[11px] font-semibold text-white ring-2 ring-(--s7-page)"
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
  href,
  expanded,
  dark,
  active,
  desktop,
  signedIn,
  icon,
  children,
}: {
  mouseX: MotionValue<number>;
  label: string;
  short?: string;
  onClick?: () => void;
  href?: string;
  expanded?: boolean;
  dark?: boolean;
  active?: boolean;
  /** Only on large screens (the home deck links). */
  desktop?: boolean;
  signedIn?: boolean;
  icon: ReactNode;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
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

  const cls = `group relative flex shrink-0 flex-col items-center justify-center gap-[3px] rounded-[16px] transition-colors duration-300 max-lg:h-[46px]! max-lg:w-[46px]! max-[380px]:w-[42px]! active:scale-95 ${
    desktop ? "max-lg:hidden!" : ""
  } ${dark ? "bg-(--s7-ink) text-(--s7-page) hover:bg-(--s7-ink-2)" : "bg-(--s7-surface)/70 text-(--s7-ink) hover:bg-(--s7-surface)"} ${
    expanded ? "ring-2 ring-(--s7-accent) ring-offset-2 ring-offset-(--s7-page)" : ""
  }`;

  const inner = (
    <>
      <span className="relative grid size-[22px] place-items-center [&>svg]:size-full lg:size-[42%]">
        {icon}
        {signedIn && <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-(--s7-accent) ring-2 ring-(--s7-page)" />}
      </span>
      <span className="max-w-[44px] truncate text-[10px] leading-none lg:hidden">{short ?? label}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-(--s7-ink) px-2.5 py-1 text-[12px] text-(--s7-page) opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
      >
        {short ?? label}
      </span>
      {active && <span aria-hidden className="absolute -bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-(--s7-ink)" />}
      {children}
    </>
  );

  if (href) {
    return (
      <MotionLink
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        style={{ width: size, height: size }}
        className={cls}
      >
        {inner}
      </MotionLink>
    );
  }
  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-current={active ? "page" : undefined}
      style={{ width: size, height: size }}
      className={cls}
    >
      {inner}
    </motion.button>
  );
}

const WOOD_LABELS: { w: Wood; label: string }[] = [
  { w: "red", label: "Red" },
  { w: "white", label: "White" },
];

/** The red / white split pill. On a product page, flipping it follows the piece into the other wood. */
export function WoodSplit({ big = false, id = "dock" }: { big?: boolean; id?: string }) {
  const current = useWood();
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  // while the page for the other wood loads, the knob already sits on the wood you chose
  const [going, start] = useTransition();
  const [target, setTarget] = useState<Wood | null>(null);
  const wood = going && target ? target : current;
  const choose = (w: Wood) => {
    setTarget(w);
    start(() => {
      chooseWood(w, pathname, router.push);
    });
  };
  const knob = `absolute inset-0 -z-10 bg-(--s7-surface) shadow-[0_4px_12px_-4px_rgba(27,23,18,0.35)] ${big ? "rounded-full" : "rounded-[12px] lg:rounded-full"}`;
  return (
    <div
      role="group"
      aria-label="Choose the wood"
      className={`relative flex shrink-0 items-center bg-(--s7-ink)/[0.07] p-1 ${
        big ? "h-[52px] rounded-full" : "h-[46px] self-end rounded-[16px] lg:mb-[1px] lg:h-[44px] lg:rounded-full"
      }`}
    >
      {WOOD_LABELS.map(({ w, label }) => {
        const on = hydrated && wood === w;
        return (
          <button
            key={w}
            type="button"
            aria-pressed={on}
            aria-label={`${label} sandalwood`}
            onClick={() => !on && choose(w)}
            className={`relative z-10 flex h-full items-center font-medium transition-colors duration-300 active:scale-95 ${
              big
                ? "gap-1.5 rounded-full px-4 text-[15px]"
                : "w-[42px] flex-col justify-center gap-[3px] rounded-[12px] text-[10px] leading-none max-[380px]:w-[38px] lg:w-auto lg:flex-row lg:gap-1.5 lg:rounded-full lg:px-2.5 lg:text-[13px]"
            } ${on ? "text-(--s7-ink)" : "text-(--s7-muted) hover:text-(--s7-ink)"}`}
          >
            {on && <motion.span layoutId={`s7-wood-${id}`} className={knob} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            {/* before hydration the page's wood comes from <html data-wood>, so CSS picks the knob */}
            {!hydrated && <span className={w === "red" ? "w-red" : "w-white"}><span className={knob} /></span>}
            <span className={`size-3.5 shrink-0 rounded-full ${w === "red" ? "ring-red" : "ring-white"}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
