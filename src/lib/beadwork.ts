/**
 * Generative beadwork-pattern record labels, seeded by song title.
 * Inspired by the geometry of isiZulu beadwork (ubuhlalu) and the concentric rings of an isicholo.
 * DESIGN ART ONLY: not official cover art.
 */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed: number) {
  let a = seed || 1;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const BEAD_COLOURS = ['#ff8a1f', '#ff2d8a', '#0b0a0c', '#f4f2f5', '#c9ccd3', '#ffd27a', '#7a1f4f'];
export type RingKind = 'beads' | 'zigzag' | 'blocks' | 'diamonds';
export interface Ring { kind: RingKind; r0: number; r1: number; count: number; colours: string[]; offset: number }
export interface LabelDesign { seed: number; bg: string; rings: Ring[] }

export function designFor(title: string): LabelDesign {
  const seed = hashSeed(title.trim().toLowerCase());
  const rand = rng(seed);
  const pick = () => BEAD_COLOURS[Math.floor(rand() * BEAD_COLOURS.length)];
  const kinds: RingKind[] = ['beads', 'zigzag', 'blocks', 'diamonds'];
  const n = 4 + Math.floor(rand() * 3);
  const rings: Ring[] = [];
  let r = 10;
  const step = (48 - 10) / n;
  for (let i = 0; i < n; i++) {
    const a = pick(); let b = pick(); if (b === a) b = BEAD_COLOURS[(BEAD_COLOURS.indexOf(a) + 3) % BEAD_COLOURS.length];
    const colours = rand() > 0.5 ? [a, b] : [a, b, pick()];
    const kind = kinds[Math.floor(rand() * kinds.length)];
    const circ = 2 * Math.PI * (r + step / 2);
    const count = Math.max(6, Math.round(circ / (kind === 'beads' ? 2.6 : 5)) * (kind === 'blocks' ? 1 : 1));
    rings.push({ kind, r0: r, r1: r + step - 0.6, count: count - (count % colours.length) || colours.length * 2, colours, offset: rand() * 360 });
    r += step;
  }
  return { seed, bg: rand() > 0.5 ? '#0b0a0c' : '#1a1418', rings };
}

const P = (r: number, deg: number) => { const t = (deg * Math.PI) / 180; return [50 + r * Math.cos(t), 50 + r * Math.sin(t)]; };
const f = (n: number) => n.toFixed(2);

/** Returns SVG path/circle primitives as plain data (rendered by BeadLabel and testable). */
export function shapesFor(d: LabelDesign) {
  const out: { tag: 'circle' | 'path'; fill: string; d?: string; cx?: number; cy?: number; r?: number }[] = [];
  for (const ring of d.rings) {
    const { r0, r1, count, colours, offset } = ring;
    const seg = 360 / count;
    for (let i = 0; i < count; i++) {
      const fill = colours[i % colours.length];
      const a0 = offset + i * seg, a1 = a0 + seg, am = a0 + seg / 2;
      if (ring.kind === 'beads') {
        const [cx, cy] = P((r0 + r1) / 2, am);
        out.push({ tag: 'circle', fill, cx: +f(cx), cy: +f(cy), r: +f(Math.min((r1 - r0) / 2, (Math.PI * (r0 + r1) / 2 * seg) / 360) * 0.9) });
      } else if (ring.kind === 'zigzag') {
        const [x0, y0] = P(r0, a0), [x1, y1] = P(r0, a1), [xm, ym] = P(r1, am);
        out.push({ tag: 'path', fill, d: `M${f(x0)} ${f(y0)}L${f(xm)} ${f(ym)}L${f(x1)} ${f(y1)}Z` });
      } else if (ring.kind === 'blocks') {
        const [a, b] = [P(r0, a0), P(r1, a0)], [c, e] = [P(r1, a1), P(r0, a1)];
        out.push({ tag: 'path', fill, d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(c[0])} ${f(c[1])}L${f(e[0])} ${f(e[1])}Z` });
      } else {
        const [p0, p1, p2, p3] = [P((r0 + r1) / 2, a0 + seg * 0.1), P(r1, am), P((r0 + r1) / 2, a1 - seg * 0.1), P(r0, am)];
        out.push({ tag: 'path', fill, d: `M${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}L${f(p2[0])} ${f(p2[1])}L${f(p3[0])} ${f(p3[1])}Z` });
      }
    }
  }
  return out;
}

/** Scrub maths for the scratch gesture: degrees of record rotation -> seconds, clamped to [0, cap]. */
export const SECONDS_PER_TURN = 1.8;
export function scrubTime(current: number, deltaDeg: number, cap: number) {
  return Math.min(cap, Math.max(0, current + (deltaDeg / 360) * SECONDS_PER_TURN));
}
/** Tonearm: angle (deg) at which the stylus is over the record. */
export const ARM_REST = -28, ARM_ON = 0, ARM_END = 22;
export const isOnRecord = (deg: number) => deg >= ARM_ON - 4;
