import { describe, it, expect } from 'vitest';
import { getRecommendation, getRecommendationText, getRecommendedLevel } from './Results';

describe('getRecommendation', () => {
  it('both >= 90% → increase', () => {
    expect(getRecommendation(95, 92, 2)).toBe('increase');
  });

  it('position < 75% → decrease (nLevel > 1)', () => {
    expect(getRecommendation(50, 95, 3)).toBe('decrease');
  });

  it('audio < 75% → decrease (nLevel > 1)', () => {
    expect(getRecommendation(95, 50, 3)).toBe('decrease');
  });

  it('position < 75% at nLevel=1 → stay', () => {
    expect(getRecommendation(50, 95, 1)).toBe('stay');
  });

  it('audio < 75% at nLevel=1 → stay', () => {
    expect(getRecommendation(95, 50, 1)).toBe('stay');
  });

  it('both < 75% at nLevel=1 → stay', () => {
    expect(getRecommendation(50, 50, 1)).toBe('stay');
  });

  it('between 75-89% → stay', () => {
    expect(getRecommendation(80, 85, 2)).toBe('stay');
  });

  it('boundary: exactly 75% → stay (not decrease)', () => {
    expect(getRecommendation(75, 80, 2)).toBe('stay');
  });

  it('boundary: exactly 90% for both → increase', () => {
    expect(getRecommendation(90, 90, 2)).toBe('increase');
  });

  it('boundary: one at 90% and other at 89% → stay', () => {
    expect(getRecommendation(90, 89, 2)).toBe('stay');
  });

  it('boundary: exactly 74.9% → decrease', () => {
    expect(getRecommendation(74.9, 95, 2)).toBe('decrease');
  });
});

describe('getRecommendationText', () => {
  it('increase → contains next level number', () => {
    const text = getRecommendationText('increase', 2);
    expect(text).toContain('3-Back');
  });

  it('decrease → contains previous level number', () => {
    const text = getRecommendationText('decrease', 3);
    expect(text).toContain('2-Back');
  });

  it('stay → contains current level number', () => {
    const text = getRecommendationText('stay', 2);
    expect(text).toContain('2-Back');
  });
});

describe('getRecommendedLevel', () => {
  it('increase returns nLevel + 1', () => {
    expect(getRecommendedLevel('increase', 2)).toBe(3);
  });

  it('decrease returns nLevel - 1', () => {
    expect(getRecommendedLevel('decrease', 3)).toBe(2);
  });

  it('stay returns nLevel', () => {
    expect(getRecommendedLevel('stay', 2)).toBe(2);
  });
});
