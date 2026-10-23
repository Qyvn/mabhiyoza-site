import { describe, expect, it } from 'vitest';
import { designFor, hashSeed, scrubTime, shapesFor, isOnRecord, ARM_REST, ARM_ON } from '../lib/beadwork';

describe('generative beadwork labels', () => {
  it('is deterministic per title and differs between titles', () => {
    expect(designFor('Asanda')).toEqual(designFor('Asanda'));
    expect(hashSeed('Asanda')).not.toBe(hashSeed('Mshanam'));
    expect(JSON.stringify(shapesFor(designFor('Asanda')))).not.toBe(JSON.stringify(shapesFor(designFor('Mshanam'))));
  });
  it('produces 4–6 rings inside the label', () => {
    for (const t of ['Nkri Nkri Nkri', 'Ngeke', 'x']) {
      const d = designFor(t);
      expect(d.rings.length).toBeGreaterThanOrEqual(4); expect(d.rings.length).toBeLessThanOrEqual(6);
      d.rings.forEach((r) => { expect(r.r0).toBeGreaterThanOrEqual(10); expect(r.r1).toBeLessThanOrEqual(48); });
    }
  });
});
describe('deck maths', () => {
  it('scrub clamps to [0, cap]', () => {
    expect(scrubTime(0, -360, 30)).toBe(0);
    expect(scrubTime(29.5, 720, 30)).toBe(30);
    expect(scrubTime(10, 360, 30)).toBeCloseTo(11.8);
  });
  it('tonearm rest is off the record; on position is on it', () => {
    expect(isOnRecord(ARM_REST)).toBe(false); expect(isOnRecord(ARM_ON)).toBe(true);
  });
});
