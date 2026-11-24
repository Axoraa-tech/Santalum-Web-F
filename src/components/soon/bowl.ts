/**
 * A Tibetan singing bowl, synthesised with Web Audio (no audio files).
 * A struck bowl is a handful of inharmonic partials, each a pair of slightly
 * detuned sines that beat slowly, decaying over many seconds, through a soft room.
 * Beneath it a very quiet drone keeps the space alive between strikes.
 */

type Bowl = {
  ctx: AudioContext;
  out: GainNode;
  room: ConvolverNode;
  drone: GainNode;
  timer: number;
};

let bowl: Bowl | null = null;
let enabled = false;
const listeners = new Set<(on: boolean) => void>();

// Partial ratios measured from real bowls, with relative level and decay (s).
const PARTIALS: [number, number, number][] = [
  [1, 1, 11],
  [2.76, 0.55, 8],
  [5.22, 0.28, 5],
  [8.43, 0.12, 3],
  [12.3, 0.05, 1.8],
];

function roomImpulse(ctx: AudioContext, seconds = 4.5) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return buf;
}

function create(): Bowl {
  const ctx = new AudioContext();
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(ctx.destination);

  const room = ctx.createConvolver();
  room.buffer = roomImpulse(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  room.connect(wet).connect(out);

  // Drone: two low sines a fifth apart, breathing very slowly.
  const drone = ctx.createGain();
  drone.gain.value = 0.018;
  drone.connect(out);
  drone.connect(room);
  for (const [f, detune] of [
    [110, 0],
    [165, 3],
    [220, -4],
  ]) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.value = f === 110 ? 1 : 0.35;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + Math.random() * 0.05;
    const depth = ctx.createGain();
    depth.gain.value = 0.25;
    lfo.connect(depth).connect(g.gain);
    o.connect(g).connect(drone);
    o.start();
    lfo.start();
  }
  return { ctx, out, room, drone, timer: 0 };
}

/** Strike the bowl. `force` 0..1 sets loudness; `pitch` shifts the base note. */
export function strike(force = 0.8, pitch = 1) {
  if (!enabled || !bowl) return;
  const { ctx, out, room } = bowl;
  const now = ctx.currentTime;
  const base = 196 * pitch; // G3: warm, not shrill
  const strikeGain = ctx.createGain();
  strikeGain.gain.value = 0.16 * force;
  strikeGain.connect(out);
  strikeGain.connect(room);

  for (const [ratio, level, decay] of PARTIALS) {
    for (const beat of [-0.6, 0.7]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = base * ratio + beat * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(level * 0.5, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      o.connect(g).connect(strikeGain);
      o.start(now);
      o.stop(now + decay + 0.1);
    }
  }
  // The soft felt of the mallet: a short filtered tap.
  const n = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  n.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const ng = ctx.createGain();
  ng.gain.value = 0.25 * force;
  n.connect(lp).connect(ng).connect(strikeGain);
  n.start(now);
}

function schedule() {
  if (!bowl) return;
  window.clearTimeout(bowl.timer);
  bowl.timer = window.setTimeout(() => {
    strike(0.45, Math.random() > 0.5 ? 1 : 0.75);
    schedule();
  }, 14000 + Math.random() * 8000);
}

export function setSound(on: boolean) {
  if (on === enabled) return;
  enabled = on;
  if (on) {
    bowl ??= create();
    const { ctx, out } = bowl;
    void ctx.resume();
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6);
    strike(0.7);
    schedule();
  } else if (bowl) {
    const { ctx, out } = bowl;
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    window.clearTimeout(bowl.timer);
  }
  listeners.forEach((l) => l(on));
}

export const soundOn = () => enabled;

export function onSound(l: (on: boolean) => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}
