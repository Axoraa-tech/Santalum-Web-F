"use client";

import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { WT } from "@/components/maison/W";
import { useWood } from "@/lib/wood";
import { c, s } from "./cls";
import { H_QUERY, isNumbered, ledgerStore, planStore, registerGoTo, registerReveal, setActiveRoom, type Room } from "./store";

type Item = { el: HTMLElement; kind: 0 | 1 | 2; c: number; amt: number };

/**
 * The pinned wall. On wide screens vertical scrolling walks you sideways: the section is as tall as the
 * track is wide, a sticky stage holds the wall, and the track is translated on X (transform only).
 * Inside, [data-par] photos drift against their frames, [data-drift] layers move at their own pace and
 * [data-lamp] lights switch on as you approach. Phones and reduced motion get the stacked guide instead.
 */
export function Corridor({
  rooms,
  label,
  register = false,
  children,
}: {
  rooms: Room[];
  label: string;
  /** the home corridor tells the left strip which room you are in and how to walk to one */
  register?: boolean;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hereN = useRef<HTMLElement>(null);
  const hereRed = useRef<HTMLSpanElement>(null);
  const hereWhite = useRef<HTMLSpanElement>(null);
  const wood = useWood();
  const goRef = useRef<(id: string, immediate?: boolean) => void>(() => {});

  useEffect(() => {
    const sec = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!sec || !stage || !track) return;

    const mq = window.matchMedia(H_QUERY);
    let horizontal = false;
    let lenis: Lenis | null = null;
    let top = 0;
    let vw = 0;
    let maxX = 0;
    let x = 0;
    let active = -1;
    let starts: number[] = [];
    let widths: number[] = [];
    let segs: { l: number; w: number }[] = [];
    let roomEls: HTMLElement[] = [];
    let items: Item[] = [];
    let measureRaf = 0;
    let vRaf = 0;
    let past = false;
    const html = document.documentElement;
    /** past the end of the walk (the visitors' book, the footer): the chrome draws its cornice again */
    const setPast = (v: boolean) => {
      if (v === past) return;
      past = v;
      html.toggleAttribute("data-c4past", v);
    };

    const pos = () => (lenis ? lenis.scroll : window.scrollY);

    const setActive = (i: number) => {
      if (i === active || i < 0) return;
      active = i;
      segRefs.current.forEach((b, k) => b?.setAttribute("aria-current", String(k === i)));
      const r = rooms[i];
      if (r && hereN.current && hereRed.current && hereWhite.current) {
        hereN.current.textContent = isNumbered(r) ? `Room ${r.n}` : "";
        hereRed.current.textContent = r.red;
        hereWhite.current.textContent = r.white;
      }
      if (register) setActiveRoom(i);
    };

    /** map a track x to the minimap */
    const toMap = (tx: number) => {
      if (!segs.length) return 0;
      let i = 0;
      for (let k = 0; k < starts.length; k++) if (starts[k] <= tx) i = k;
      const f = widths[i] ? Math.min(1, Math.max(0, (tx - starts[i]) / widths[i])) : 0;
      return segs[i].l + f * segs[i].w;
    };

    const apply = () => {
      if (!horizontal) return;
      x = Math.min(maxX, Math.max(0, pos() - top));
      track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
      for (const it of items) {
        if (it.kind === 1) {
          it.el.style.transform = `translate3d(${(x * it.amt).toFixed(1)}px,0,0)`;
          continue;
        }
        const sx = it.c - x;
        if (it.kind === 2) {
          const o = Math.min(1, Math.max(0, (vw * 0.94 - sx) / (vw * 0.32)));
          it.el.style.opacity = o.toFixed(3);
          continue;
        }
        if (sx < -vw * 0.6 || sx > vw * 1.6) continue;
        const d = (sx - vw / 2) / vw;
        it.el.style.transform = `translate3d(${(-d * it.amt).toFixed(2)}px,0,0)`;
      }
      let i = 0;
      const probe = x + vw * 0.42;
      for (let k = 0; k < starts.length; k++) if (starts[k] <= probe) i = k;
      if (x >= maxX - 2) i = starts.length - 1;
      setActive(i);
      // past the end of the walk (the visitors' book, the footer): the map steps aside
      setPast(pos() > top + maxX + 60);
      const map = mapRef.current;
      if (map) {
        map.style.opacity = past ? "0" : "";
        map.style.pointerEvents = past ? "none" : "";
      }
      const view = viewRef.current;
      if (view && segs.length) {
        const a = toMap(x);
        const b = toMap(Math.min(x + vw, starts[starts.length - 1] + widths[widths.length - 1] - 1));
        view.style.transform = `translate3d(${a.toFixed(1)}px,0,0)`;
        view.style.width = `${Math.max(8, b - a).toFixed(1)}px`;
      }
    };

    const measure = () => {
      roomEls = Array.from(track.querySelectorAll<HTMLElement>(":scope > [data-room]"));
      const all = Array.from(track.querySelectorAll<HTMLElement>("[data-par],[data-drift],[data-lamp]"));
      if (!horizontal) {
        setPast(false);
        sec.style.height = "";
        track.style.transform = "";
        all.forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
        });
        items = [];
        return;
      }
      track.style.transform = "translate3d(0,0,0)";
      all.forEach((el) => {
        if (!el.hasAttribute("data-lamp")) el.style.transform = "";
      });
      vw = stage.clientWidth;
      const trackW = track.scrollWidth;
      maxX = Math.max(0, trackW - vw);
      sec.style.height = `${Math.round(maxX + window.innerHeight)}px`;
      top = sec.getBoundingClientRect().top + window.scrollY;
      const t0 = track.getBoundingClientRect().left;
      starts = roomEls.map((el) => el.getBoundingClientRect().left - t0);
      widths = roomEls.map((el) => el.offsetWidth);
      items = [];
      for (const el of all) {
        const par = el.hasAttribute("data-par");
        const box = (par ? el.parentElement : el) ?? el;
        const r = box.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue; // the other wood, not displayed
        const kind: Item["kind"] = par ? 0 : el.hasAttribute("data-drift") ? 1 : 2;
        items.push({
          el,
          kind,
          c: r.left - t0 + r.width / 2,
          amt: kind === 0 ? r.width * 0.065 : kind === 1 ? Number(el.dataset.drift) || 0 : 0,
        });
      }
      // minimap: segments proportional to the rooms
      segRefs.current.forEach((b, i) => {
        if (b) b.style.flexGrow = String(widths[i] ?? 1);
      });
      segs = segRefs.current.map((b) => ({ l: b?.offsetLeft ?? 0, w: b?.offsetWidth ?? 0 }));
      lenis?.resize();
      apply();
    };

    const schedule = () => {
      cancelAnimationFrame(measureRaf);
      measureRaf = requestAnimationFrame(measure);
    };

    const onVScroll = () => {
      cancelAnimationFrame(vRaf);
      vRaf = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.35;
        let i = 0;
        roomEls.forEach((el, k) => {
          if (el.getBoundingClientRect().top <= line) i = k;
        });
        setActive(i);
      });
    };

    const onScroll = () => {
      if (!horizontal) onVScroll();
      else if (!lenis) apply();
    };

    const goTo = (id: string, immediate = false) => {
      const i = roomEls.findIndex((el) => el.dataset.room === id);
      if (i < 0) return;
      if (horizontal) {
        const target = top + Math.min(maxX, starts[i]);
        if (lenis) {
          const dist = Math.abs(target - pos());
          lenis.scrollTo(target, {
            immediate,
            force: true,
            duration: Math.min(2.6, 0.9 + dist / 9000),
            easing: (t) => 1 - Math.pow(1 - t, 4),
          });
        } else window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
      } else {
        // clear the phone bar, or the cornice on wide screens
        const offset = window.innerWidth < 900 ? 56 : 64;
        const y = roomEls[i].getBoundingClientRect().top + window.scrollY - offset;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: y, behavior: immediate || reduce ? "auto" : "smooth" });
      }
    };
    goRef.current = goTo;
    if (register) registerGoTo(goTo);

    /** Bring something on the wall fully into view: walk sideways to it, or scroll the guide to it. */
    const reveal = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      if (horizontal) {
        const sx = r.left - stage.getBoundingClientRect().left;
        const margin = vw * 0.035;
        let dx = 0;
        if (sx + r.width > vw - margin) dx = sx + r.width - (vw - margin);
        if (sx - dx < margin) dx = sx - margin;
        if (Math.abs(dx) < 2) return;
        const target = top + Math.min(maxX, Math.max(0, x + dx));
        if (lenis) lenis.scrollTo(target, { force: true, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
        else window.scrollTo({ top: target, behavior: "smooth" });
        return;
      }
      const bar = window.innerWidth < 900 ? 56 : 64;
      if (r.top >= bar && r.top < window.innerHeight * 0.72) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: window.scrollY + r.top - bar - 16, behavior: reduce ? "auto" : "smooth" });
    };
    if (register) registerReveal(reveal);

    const setMode = () => {
      horizontal = mq.matches;
      if (horizontal && !lenis) {
        lenis = new Lenis({ autoRaf: true, gestureOrientation: "both", lerp: 0.09, wheelMultiplier: 1.15 });
        lenis.on("scroll", apply);
      } else if (!horizontal && lenis) {
        lenis.destroy();
        lenis = null;
      }
      active = -1;
      measure();
      if (!horizontal) onVScroll();
    };

    // keyboard focus inside the clipped stage: undo the browser's own scroll and walk to the element instead
    const onFocus = (e: FocusEvent) => {
      if (!horizontal) return;
      const el = e.target as HTMLElement;
      requestAnimationFrame(() => {
        stage.scrollLeft = 0;
        stage.scrollTop = 0;
        const r = el.getBoundingClientRect();
        const sx = r.left - stage.getBoundingClientRect().left;
        if (sx < vw * 0.04 || sx + Math.min(r.width, vw * 0.5) > vw * 0.96) {
          const target = top + Math.min(maxX, Math.max(0, x + sx - vw * 0.3));
          if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
          else window.scrollTo(0, target);
        }
      });
    };
    const onStageScroll = () => {
      if (stage.scrollLeft || stage.scrollTop) {
        stage.scrollLeft = 0;
        stage.scrollTop = 0;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (!horizontal || ledgerStore.get() || planStore.get() || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const step = (e.key === "ArrowRight" ? 1 : -1) * vw * 0.55;
      const target = Math.min(top + maxX, Math.max(top, pos() + step));
      if (lenis) lenis.scrollTo(target, { duration: 0.9, easing: (t2) => 1 - Math.pow(1 - t2, 3) });
      else window.scrollTo({ top: target, behavior: "smooth" });
    };

    setMode();
    mq.addEventListener("change", setMode);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("keydown", onKey);
    track.addEventListener("focusin", onFocus);
    stage.addEventListener("scroll", onStageScroll);
    const ro = new ResizeObserver(schedule);
    ro.observe(track);
    ro.observe(stage);
    // the wood switch swaps photographs and, in the gallery, the number of exhibits
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-wood"] });
    document.fonts?.ready.then(schedule).catch(() => {});
    const onSheet = () => {
      if (ledgerStore.get() || planStore.get()) lenis?.stop();
      else lenis?.start();
    };
    const unLedger = ledgerStore.subscribe(onSheet);
    const unPlan = planStore.subscribe(onSheet);

    // arriving with a room in the URL (from the strip on another page)
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const hashTimer = hash ? window.setTimeout(() => goTo(hash, true), 90) : 0;

    return () => {
      window.clearTimeout(hashTimer);
      cancelAnimationFrame(measureRaf);
      cancelAnimationFrame(vRaf);
      mq.removeEventListener("change", setMode);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("keydown", onKey);
      track.removeEventListener("focusin", onFocus);
      stage.removeEventListener("scroll", onStageScroll);
      ro.disconnect();
      mo.disconnect();
      unLedger();
      unPlan();
      lenis?.destroy();
      sec.style.height = "";
      html.removeAttribute("data-c4past");
      if (register) {
        registerGoTo(null);
        registerReveal(null);
        setActiveRoom(-1);
      }
    };
  }, [rooms, register]);

  return (
    <>
      <section ref={sectionRef} className={s.section} aria-label={label}>
        <div ref={stageRef} className={s.stage}>
          <div ref={trackRef} className={s.track}>
            {children}
          </div>
        </div>
      </section>

      <nav ref={mapRef} className={c.minimap} aria-label="Map of the rooms">
        <p className={c.mmLabel}>
          <b ref={hereN}>{isNumbered(rooms[0]) ? `Room ${rooms[0].n}` : ""}</b>
          <span className="w-red" ref={hereRed}>
            {rooms[0].red}
          </span>
          <span className="w-white" ref={hereWhite}>
            {rooms[0].white}
          </span>
        </p>
        <div className={c.segs}>
          {rooms.map((r, i) => (
            <button
              key={r.id}
              ref={(el) => {
                segRefs.current[i] = el;
              }}
              type="button"
              className={c.seg}
              aria-current={i === 0}
              aria-label={isNumbered(r) ? `Walk to room ${r.n}, ${r[wood]}` : `Walk to the ${r[wood].toLowerCase()}`}
              onClick={() => goRef.current(r.id)}
            >
              <span className={c.segN} aria-hidden="true">
                {r.n}
              </span>
              <span className={c.segName} aria-hidden="true">
                <WT red={r.red} white={r.white} />
              </span>
            </button>
          ))}
        </div>
        <div ref={viewRef} className={c.viewport} aria-hidden="true" />
      </nav>
    </>
  );
}
