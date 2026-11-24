import { useSyncExternalStore } from "react";
import { BOARD, TITLE, WAYPOINTS, cardRect, detailRect, union, type Rect } from "./board";

/**
 * The Atlas camera. One module-level instance drives the board: it writes the world transform,
 * the dot grid and the minimap rectangle straight to the DOM each frame (no React renders while moving),
 * and keeps a tiny UI store (open product, tour step) that React subscribes to.
 */

type Cam = { x: number; y: number; z: number }; // world point at the viewport centre, and zoom
type UI = { open: string | null; tour: number | null; ready: boolean; narrow: boolean };

const Z_MAX = 2.4;
const GRID = 32;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Smooth zoom-and-pan path (van Wijk & Nuij 2003) between two views given as [cx, cy, width]. */
function zoomPath(p0: [number, number, number], p1: [number, number, number], rho = 1.25) {
  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  const [ux0, uy0, w0] = p0;
  const [ux1, uy1, w1] = p1;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  let S: number;
  let f: (t: number) => [number, number, number];
  if (d2 < 1e-6) {
    S = Math.log(w1 / w0) / rho;
    f = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  } else {
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    f = (t) => {
      const s = t * S;
      const c0 = Math.cosh(r0);
      const u = (w0 / (rho2 * d1)) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)];
    };
  }
  return { f, ms: Math.abs(S) * 1000 * (rho / Math.SQRT2) };
}

class Atlas {
  vp: HTMLDivElement | null = null;
  world: HTMLDivElement | null = null;
  grid: HTMLDivElement | null = null;
  miniRect: SVGRectElement | null = null;
  zoomLabel: HTMLElement | null = null;
  vw = 0;
  vh = 0;
  cam: Cam = { x: BOARD.w / 2, y: BOARD.h / 2, z: 0.4 };
  private vx = 0;
  private vy = 0;
  private zoomGoal: { z: number; sx: number; sy: number } | null = null;
  private flight: { f: (t: number) => [number, number, number]; t0: number; ms: number; done?: () => void } | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private drag: { id: number; sx: number; sy: number; lx: number; ly: number; lt: number; moved: boolean } | null = null;
  private pinch: { d0: number; z0: number; wx: number; wy: number } | null = null;
  private suppressClick = false;
  private raf = 0;
  private lastT = 0;
  private idle = 0;
  private reduce = false;
  private introduced = false;
  /** A product to open the next time the board mounts (e.g. "back to the board" from a product page). */
  pending: string | null = null;

  /* ---------------- UI store ---------------- */
  ui: UI = { open: null, tour: null, ready: false, narrow: false };
  private listeners = new Set<() => void>();
  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };
  getUI = () => this.ui;
  private setUI(patch: Partial<UI>) {
    this.ui = { ...this.ui, ...patch };
    this.listeners.forEach((l) => l());
  }

  /* ---------------- lifecycle ---------------- */
  attach(vp: HTMLDivElement, world: HTMLDivElement, grid: HTMLDivElement) {
    this.vp = vp;
    this.world = world;
    this.grid = grid;
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.measure();

    vp.addEventListener("pointerdown", this.onDown);
    vp.addEventListener("pointermove", this.onMove);
    vp.addEventListener("pointerup", this.onUp);
    vp.addEventListener("pointercancel", this.onUp);
    vp.addEventListener("wheel", this.onWheel, { passive: false });
    vp.addEventListener("click", this.onClickCapture, true);
    vp.addEventListener("focusin", this.onFocusIn);
    vp.addEventListener("scroll", this.onScroll);
    window.addEventListener("keydown", this.onKey);
    const ro = new ResizeObserver(() => {
      this.measure();
      if (!this.booted) this.boot();
      this.cam = this.clampCam(this.cam);
      this.request();
    });
    ro.observe(vp);
    this.booted = false;
    this.boot();
    this.setUI({ ready: true });

    return () => {
      vp.removeEventListener("pointerdown", this.onDown);
      vp.removeEventListener("pointermove", this.onMove);
      vp.removeEventListener("pointerup", this.onUp);
      vp.removeEventListener("pointercancel", this.onUp);
      vp.removeEventListener("wheel", this.onWheel);
      vp.removeEventListener("click", this.onClickCapture, true);
      vp.removeEventListener("focusin", this.onFocusIn);
      vp.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("keydown", this.onKey);
      ro.disconnect();
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.flight = null;
      this.vp = this.world = this.grid = null;
      this.setUI({ ready: false, tour: null });
    };
  }

  private booted = false;
  private introTimer = 0;
  /** Runs once the board has a size (it may mount hidden, e.g. on a phone in list view). */
  private boot() {
    if (this.booted || this.vw === 0) return;
    this.booted = true;
    const start = this.startCam();
    if (this.pending) {
      const slug = this.pending;
      this.pending = null;
      this.introduced = true;
      this.cam = this.frameRect(cardRect(slug), { maxZ: 1 });
      this.reveal(false);
      this.openProduct(slug);
    } else if (!this.introduced) {
      this.introduced = true;
      if (this.reduce) {
        this.cam = start;
        this.reveal(false);
      } else {
        // The one orchestrated moment: the whole board, then the camera settles on the title plate.
        this.cam = this.fitBoard();
        this.reveal(true);
        this.introTimer = window.setTimeout(() => this.flyTo(start, { ms: 1900 }), 380);
      }
    } else {
      this.reveal(false);
      // Re-attached (e.g. back from the list view): pick up an open product where it was.
      if (this.ui.open) this.openProduct(this.ui.open);
    }
    this.apply();
  }

  private reveal(animate: boolean) {
    const w = this.world;
    if (!w) return;
    w.style.transition = animate ? "opacity 0.9s cubic-bezier(0.22,1,0.36,1)" : "none";
    w.style.opacity = "1";
  }

  private measure() {
    if (!this.vp) return;
    this.vw = this.vp.clientWidth;
    this.vh = this.vp.clientHeight;
    const narrow = this.vw > 0 && this.vw < 900;
    if (narrow !== this.ui.narrow) this.setUI({ narrow });
  }

  /** True when the board is mounted and visible. */
  get live() {
    return !!this.vp && this.vp.clientWidth > 0;
  }

  /* ---------------- geometry ---------------- */
  get zMin() {
    if (!this.vw) return 0.1;
    return Math.min(this.vw / BOARD.w, this.vh / BOARD.h) * 0.9;
  }

  private insets() {
    const narrow = this.vw < 900;
    const tour = this.ui.tour !== null;
    const captionBelow = this.vw >= 1200;
    return {
      t: (narrow ? 70 : 84) + (tour && !captionBelow ? (narrow ? 170 : 130) : 0),
      b: tour && captionBelow ? 136 : narrow ? 24 : 40,
      l: narrow ? 12 : 40,
      r: narrow ? 12 : 40,
    };
  }

  frameRect(r: Rect, opts: { maxZ?: number; pad?: number; right?: number } = {}): Cam {
    const i = this.insets();
    if (opts.right) i.r += opts.right;
    const pad = opts.pad ?? (this.vw < 900 ? 8 : 18);
    const aw = Math.max(80, this.vw - i.l - i.r - pad * 2);
    const ah = Math.max(80, this.vh - i.t - i.b - pad * 2);
    const z = clamp(Math.min(aw / r.w, ah / r.h), this.zMin, opts.maxZ ?? 1.25);
    const x = r.x + r.w / 2 - (i.l - i.r) / (2 * z);
    const y = r.y + r.h / 2 - (i.t - i.b) / (2 * z);
    return this.clampCam({ x, y, z });
  }

  fitBoard(): Cam {
    const i = this.insets();
    const z = Math.min((this.vw - i.l - i.r) / BOARD.w, (this.vh - i.t - i.b) / BOARD.h) * 0.97;
    return { x: BOARD.w / 2, y: BOARD.h / 2 - (i.t - i.b) / (2 * z), z: Math.max(0.05, z) };
  }

  private bounds(z: number) {
    const hw = this.vw / (2 * z);
    const hh = this.vh / (2 * z);
    const mx = (0.32 * this.vw) / z;
    const my = (0.32 * this.vh) / z;
    let x0 = hw - mx;
    let x1 = BOARD.w - hw + mx;
    let y0 = hh - my;
    let y1 = BOARD.h - hh + my;
    if (x0 > x1) x0 = x1 = BOARD.w / 2;
    if (y0 > y1) y0 = y1 = BOARD.h / 2;
    return { x0, x1, y0, y1 };
  }

  clampCam(c: Cam): Cam {
    const z = clamp(c.z, this.zMin, Z_MAX);
    const b = this.bounds(z);
    return { x: clamp(c.x, b.x0, b.x1), y: clamp(c.y, b.y0, b.y1), z };
  }

  /** The visible part of the board, in world units. */
  viewRect(): Rect {
    const { x, y, z } = this.cam;
    return { x: x - this.vw / (2 * z), y: y - this.vh / (2 * z), w: this.vw / z, h: this.vh / z };
  }

  /* ---------------- rendering ---------------- */
  request() {
    if (!this.raf) this.raf = requestAnimationFrame(this.loop);
  }

  private loop = (t: number) => {
    this.raf = 0;
    const dt = this.lastT ? Math.min(48, t - this.lastT) : 16.7;
    this.lastT = t;
    let active = false;

    if (this.flight) {
      const fl = this.flight;
      const p = clamp((t - fl.t0) / fl.ms, 0, 1);
      const [x, y, w] = fl.f(easeInOut(p));
      this.cam = { x, y, z: this.vw / w };
      if (p >= 1) {
        this.flight = null;
        fl.done?.();
      } else active = true;
    } else if (!this.drag && !this.pinch) {
      const k = dt / 16.7;
      if (Math.abs(this.vx) + Math.abs(this.vy) > 0.004) {
        this.cam.x -= (this.vx * dt) / this.cam.z;
        this.cam.y -= (this.vy * dt) / this.cam.z;
        const decay = Math.pow(0.935, k);
        this.vx *= decay;
        this.vy *= decay;
        active = true;
      } else {
        this.vx = this.vy = 0;
      }
      if (this.zoomGoal) {
        const g = this.zoomGoal;
        const a = 1 - Math.pow(1 - 0.24, k);
        const nz = this.cam.z + (g.z - this.cam.z) * a;
        const done = Math.abs(g.z - nz) < 0.0008;
        this.zoomAround(g.sx, g.sy, done ? g.z : nz);
        if (done) this.zoomGoal = null;
        else active = true;
      }
      const c = this.clampCam(this.cam);
      const ox = c.x - this.cam.x;
      const oy = c.y - this.cam.y;
      if (Math.abs(ox) > 0.3 || Math.abs(oy) > 0.3 || c.z !== this.cam.z) {
        const a = 1 - Math.pow(1 - 0.2, k);
        this.cam = { x: this.cam.x + ox * a, y: this.cam.y + oy * a, z: c.z };
        if (Math.abs(ox) > 0.3 || Math.abs(oy) > 0.3) {
          this.vx *= 0.5;
          this.vy *= 0.5;
          active = true;
        }
      }
    }

    this.apply();
    if (active) this.raf = requestAnimationFrame(this.loop);
    else this.lastT = 0;
  };

  private apply() {
    const { world, grid } = this;
    if (!world || !this.vw) return;
    const { x, y, z } = this.cam;
    const tx = this.vw / 2 - x * z;
    const ty = this.vh / 2 - y * z;
    world.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${z.toFixed(4)})`;
    // Composite while moving; drop the hint when still so text re-rasterises crisply at the new scale.
    if (world.style.willChange !== "transform") world.style.willChange = "transform";
    window.clearTimeout(this.idle);
    this.idle = window.setTimeout(() => {
      if (this.world && !this.flight && !this.drag && !this.pinch) this.world.style.willChange = "auto";
    }, 220);

    if (grid) {
      let s = GRID * z;
      while (s < 15) s *= 2;
      while (s > 44) s /= 2;
      const big = s * 4;
      grid.style.backgroundSize = `${s}px ${s}px, ${big}px ${big}px`;
      grid.style.backgroundPosition = `${tx}px ${ty}px, ${tx}px ${ty}px`;
    }
    const m = this.miniRect;
    if (m) {
      const v = this.viewRect();
      m.setAttribute("x", v.x.toFixed(0));
      m.setAttribute("y", v.y.toFixed(0));
      m.setAttribute("width", v.w.toFixed(0));
      m.setAttribute("height", v.h.toFixed(0));
    }
    if (this.zoomLabel) this.zoomLabel.textContent = `${Math.round(z * 100)}%`;
  }

  bindMini = (el: SVGRectElement | null) => {
    this.miniRect = el;
    if (el) this.apply();
  };
  bindZoomLabel = (el: HTMLElement | null) => {
    this.zoomLabel = el;
    if (el) this.apply();
  };

  /* ---------------- camera moves ---------------- */
  stop() {
    window.clearTimeout(this.introTimer);
    this.flight = null;
    this.zoomGoal = null;
    this.vx = this.vy = 0;
  }

  flyTo(target: Cam, opts: { ms?: number; done?: () => void } = {}) {
    if (!this.vw) return;
    const to = this.clampCam(target);
    this.zoomGoal = null;
    this.vx = this.vy = 0;
    if (this.reduce) {
      this.flight = null;
      this.cam = to;
      this.apply();
      opts.done?.();
      return;
    }
    const path = zoomPath([this.cam.x, this.cam.y, this.vw / this.cam.z], [to.x, to.y, this.vw / to.z]);
    const ms = opts.ms ?? clamp(path.ms * 0.85, 520, 1700);
    this.flight = { f: path.f, t0: performance.now(), ms, done: opts.done };
    this.request();
  }

  flyToRect(r: Rect, opts: { maxZ?: number; ms?: number; right?: number; done?: () => void } = {}) {
    this.flyTo(this.frameRect(r, { maxZ: opts.maxZ, right: opts.right }), opts);
  }

  private zoomAround(sx: number, sy: number, nz: number) {
    const { x, y, z } = this.cam;
    const wx = x + (sx - this.vw / 2) / z;
    const wy = y + (sy - this.vh / 2) / z;
    this.cam = { x: wx - (sx - this.vw / 2) / nz, y: wy - (sy - this.vh / 2) / nz, z: nz };
  }

  /** Zoom by a factor around a screen point (viewport-relative). Eased. */
  zoomBy(f: number, sx = this.vw / 2, sy = this.vh / 2) {
    this.flight = null;
    const base = this.zoomGoal ? this.zoomGoal.z : this.cam.z;
    const z = clamp(base * f, this.zMin, Z_MAX);
    if (this.reduce) {
      this.zoomAround(sx, sy, z);
      this.cam = this.clampCam(this.cam);
      this.apply();
      return;
    }
    this.zoomGoal = { z, sx, sy };
    this.request();
  }

  centerOn(x: number, y: number) {
    this.stop();
    this.cam = this.clampCam({ x, y, z: this.cam.z });
    this.request();
  }

  /* ---------------- input ---------------- */
  private onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, label, [data-nodrag]")) return;
    this.stop();
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1) {
      this.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: e.timeStamp, moved: false };
    } else if (this.pointers.size === 2 && this.vp) {
      const [a, b] = [...this.pointers.values()];
      const r = this.vp.getBoundingClientRect();
      const mx = (a.x + b.x) / 2 - r.left;
      const my = (a.y + b.y) / 2 - r.top;
      const { x, y, z } = this.cam;
      this.pinch = {
        d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
        z0: z,
        wx: x + (mx - this.vw / 2) / z,
        wy: y + (my - this.vh / 2) / z,
      };
      this.suppressClick = true;
      for (const id of this.pointers.keys()) {
        try {
          this.vp.setPointerCapture(id);
        } catch {}
      }
      this.drag = null;
    }
  };

  private onMove = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    if (!p || !this.vp) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (this.pinch && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const r = this.vp.getBoundingClientRect();
      const mx = (a.x + b.x) / 2 - r.left;
      const my = (a.y + b.y) / 2 - r.top;
      const nz = clamp(this.pinch.z0 * (Math.hypot(a.x - b.x, a.y - b.y) / this.pinch.d0), this.zMin, Z_MAX);
      this.cam = { x: this.pinch.wx - (mx - this.vw / 2) / nz, y: this.pinch.wy - (my - this.vh / 2) / nz, z: nz };
      this.request();
      return;
    }
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) {
      const thr = e.pointerType === "mouse" ? 4 : 8;
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < thr) return;
      d.moved = true;
      try {
        this.vp.setPointerCapture(e.pointerId);
      } catch {}
      this.vp.dataset.dragging = "true";
    }
    const dx = e.clientX - d.lx;
    const dy = e.clientY - d.ly;
    const dt = Math.max(1, e.timeStamp - d.lt);
    const { z } = this.cam;
    const b = this.bounds(z);
    let nx = this.cam.x - dx / z;
    let ny = this.cam.y - dy / z;
    // Rubber band past the edges of the board.
    if ((nx < b.x0 && nx < this.cam.x) || (nx > b.x1 && nx > this.cam.x)) nx = this.cam.x - (dx / z) * 0.3;
    if ((ny < b.y0 && ny < this.cam.y) || (ny > b.y1 && ny > this.cam.y)) ny = this.cam.y - (dy / z) * 0.3;
    this.cam = { x: nx, y: ny, z };
    this.vx = clamp(0.25 * this.vx + 0.75 * (dx / dt), -4, 4);
    this.vy = clamp(0.25 * this.vy + 0.75 * (dy / dt), -4, 4);
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.lt = e.timeStamp;
    this.request();
  };

  private onUp = (e: PointerEvent) => {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    if (this.pinch) {
      if (this.pointers.size < 2) {
        this.pinch = null;
        const rest = [...this.pointers.entries()][0];
        if (rest) {
          const [id, p] = rest;
          this.drag = { id, sx: p.x, sy: p.y, lx: p.x, ly: p.y, lt: e.timeStamp, moved: true };
        }
        this.vx = this.vy = 0;
        window.setTimeout(() => (this.suppressClick = false), 0);
        this.request();
      }
      return;
    }
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    this.drag = null;
    if (this.vp) delete this.vp.dataset.dragging;
    if (d.moved) {
      this.suppressClick = true;
      window.setTimeout(() => (this.suppressClick = false), 0);
      if (e.timeStamp - d.lt > 90 || this.reduce) this.vx = this.vy = 0;
    } else {
      this.vx = this.vy = 0;
    }
    this.request();
  };

  private onClickCapture = (e: MouseEvent) => {
    if (this.suppressClick) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.vp) return;
    e.preventDefault();
    window.clearTimeout(this.introTimer);
    this.flight = null;
    let dx = e.deltaX;
    let dy = e.deltaY;
    if (e.deltaMode === 1) {
      dx *= 16;
      dy *= 16;
    } else if (e.deltaMode === 2) {
      dx *= this.vh;
      dy *= this.vh;
    }
    const r = this.vp.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const z = this.cam.z;
    if (e.ctrlKey || e.metaKey) {
      // Trackpad pinch (and ctrl + wheel).
      this.zoomGoal = null;
      this.zoomAround(sx, sy, clamp(z * Math.exp(-dy * 0.012), this.zMin, Z_MAX));
      this.cam = this.clampCam(this.cam);
      this.request();
    } else if (e.shiftKey) {
      this.vx = this.vy = 0;
      this.cam = this.clampCam({ x: this.cam.x + (dx || dy) / z, y: this.cam.y, z });
      this.request();
    } else if (e.deltaMode !== 0 || (Math.abs(dx) < 0.5 && Math.abs(dy) >= 50 && Number.isInteger(dy))) {
      // A mouse wheel notch zooms around the cursor.
      this.zoomBy(Math.exp(-clamp(dy, -240, 240) * 0.0022), sx, sy);
    } else {
      // Two-finger trackpad scroll pans the board.
      this.vx = this.vy = 0;
      this.cam = this.clampCam({ x: this.cam.x + dx / z, y: this.cam.y + dy / z, z });
      this.request();
    }
  };

  private onScroll = () => {
    // Focus can scroll an overflow:hidden box; the camera owns position, so undo it.
    if (this.vp && (this.vp.scrollTop || this.vp.scrollLeft)) {
      this.vp.scrollTop = 0;
      this.vp.scrollLeft = 0;
    }
  };

  private onFocusIn = (e: FocusEvent) => {
    this.onScroll();
    if (!this.vp || this.flight || this.drag) return;
    const el = e.target as HTMLElement | null;
    if (!el || el === this.vp || !el.matches(":focus-visible")) return;
    const v = this.vp.getBoundingClientRect();
    const node = (el.closest("[data-node]") as HTMLElement | null) ?? el;
    const r = node.getBoundingClientRect();
    const i = this.insets();
    const inView = r.left >= v.left + i.l && r.right <= v.right - i.r && r.top >= v.top + i.t && r.bottom <= v.bottom - i.b;
    if (inView) return;
    const { z } = this.cam;
    const tx = this.vw / 2 - this.cam.x * z;
    const ty = this.vh / 2 - this.cam.y * z;
    const w: Rect = { x: (r.left - v.left - tx) / z, y: (r.top - v.top - ty) / z, w: r.width / z, h: r.height / z };
    this.flyToRect({ x: w.x - 60, y: w.y - 60, w: w.w + 120, h: w.h + 120 }, { maxZ: 1.1, ms: 520 });
  };

  private onKey = (e: KeyboardEvent) => {
    if (!this.live || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement | null;
    if (t && t.closest("input, textarea, select, [contenteditable='true'], [role='dialog'][aria-modal='true']")) return;
    if (this.ui.tour !== null) {
      if (e.key === "ArrowRight") return this.keyed(e, () => this.tourGo(this.ui.tour! + 1));
      if (e.key === "ArrowLeft") return this.keyed(e, () => this.tourGo(this.ui.tour! - 1));
      if (e.key === "Escape") return this.keyed(e, () => this.endTour());
    }
    if (e.key === "Escape" && this.ui.open) return this.keyed(e, () => this.closeProduct());
    const step = e.shiftKey ? 2.4 : 1.1;
    switch (e.key) {
      case "ArrowLeft":
        return this.keyed(e, () => this.nudge(-step, 0));
      case "ArrowRight":
        return this.keyed(e, () => this.nudge(step, 0));
      case "ArrowUp":
        return this.keyed(e, () => this.nudge(0, -step));
      case "ArrowDown":
        return this.keyed(e, () => this.nudge(0, step));
      case "+":
      case "=":
        return this.keyed(e, () => this.zoomBy(1.35));
      case "-":
      case "_":
        return this.keyed(e, () => this.zoomBy(1 / 1.35));
      case "0":
        return this.keyed(e, () => this.flyTo(this.fitBoard()));
    }
  };

  private keyed(e: KeyboardEvent, fn: () => void) {
    e.preventDefault();
    fn();
  }

  private nudge(x: number, y: number) {
    this.flight = null;
    if (this.reduce) {
      const z = this.cam.z;
      this.cam = this.clampCam({ x: this.cam.x + (x * 140) / z, y: this.cam.y + (y * 140) / z, z });
      this.apply();
      return;
    }
    // Velocity is in screen px/ms and the camera moves against it.
    this.vx = -x;
    this.vy = -y;
    this.request();
  }

  /* ---------------- product, regions, tour ---------------- */
  openProduct(slug: string) {
    if (this.ui.tour !== null) this.setUI({ tour: null });
    this.setUI({ open: slug });
    if (!this.vw) return;
    const narrow = this.vw < 900;
    const target = narrow ? cardRect(slug) : union(cardRect(slug), detailRect(slug));
    const pad = 40;
    this.flyToRect({ x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2 }, {
      maxZ: narrow ? 0.9 : 1.2,
      // keep the detail clear of the minimap panel, bottom right
      right: narrow ? 0 : 250,
      done: () => {
        const el = document.getElementById("a8-detail-title");
        el?.focus({ preventScroll: true });
      },
    });
  }

  closeProduct() {
    const slug = this.ui.open;
    this.setUI({ open: null });
    if (slug) {
      const el = document.querySelector<HTMLElement>(`[data-card="${slug}"]`);
      el?.focus({ preventScroll: true });
    }
  }

  /** The opening frame: the title plate and map; on a phone, just the headline. */
  startCam(): Cam {
    if (this.vw < 640) return this.frameRect({ x: TITLE.x - 20, y: TITLE.y + 60, w: 1180, h: 1100 }, { maxZ: 0.6 });
    return this.frameRect(WAYPOINTS[0].rect, { maxZ: 0.95 });
  }

  startTour() {
    this.setUI({ tour: 0, open: null });
    this.flyTo(this.vw < 640 ? this.startCam() : this.frameRect(WAYPOINTS[0].rect, { maxZ: 0.95 }));
  }

  tourGo(i: number) {
    if (i < 0 || i >= WAYPOINTS.length) return;
    this.setUI({ tour: i });
    this.flyToRect(WAYPOINTS[i].rect, { maxZ: 1 });
  }

  endTour() {
    this.setUI({ tour: null });
  }

  /** The wood pins: fly to a region. */
  goRegion(w: "red" | "white") {
    if (!this.live) return;
    this.setUI({ open: null, tour: null });
    this.flyToRect(WAYPOINTS.find((p) => p.id === w)!.rect, { maxZ: 1 });
  }
}

export const atlas = new Atlas();

const SERVER_UI: UI = { open: null, tour: null, ready: false, narrow: false };
export function useAtlasUI() {
  return useSyncExternalStore(atlas.subscribe, atlas.getUI, () => SERVER_UI);
}
