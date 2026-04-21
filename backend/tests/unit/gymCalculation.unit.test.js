import { describe, it, expect } from 'vitest';
import { calculateCalories } from '../../src/utils/gymCalculation.js';

describe('calculateCalories', () => {
  it('calculates MET formula correctly for integer result', () => {
    // (8 * 3.5 * 70 * 30) / 200 = 294
    expect(calculateCalories(8, 70, 30)).toBe(294);
  });

  it('rounds to nearest integer when formula returns decimal', () => {
    // (3 * 3.5 * 67 * 17) / 200 = 59.7975 -> 60
    expect(calculateCalories(3, 67, 17)).toBe(60);
  });

  it('returns 0 when duration is zero', () => {
    expect(calculateCalories(6, 75, 0)).toBe(0);
  });

  it('returns 0 when duration is null', () => {
    expect(calculateCalories(6, 75, null)).toBe(0);
  });

  it('returns 0 when weight is null (null weight fallback)', () => {
    expect(calculateCalories(6, null, 20)).toBe(0);
  });

  it('returns 0 when MET value is missing', () => {
    expect(calculateCalories(undefined, 70, 20)).toBe(0);
  });
});
