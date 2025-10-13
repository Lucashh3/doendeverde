import { describe, expect, it } from 'vitest';

import { slugifyTag } from '../slugify';

describe('slugifyTag', () => {
  it('normalizes spaces and casing', () => {
    expect(slugifyTag('Grow Indoor')).toBe('grow-indoor');
  });

  it('strips special characters and accents', () => {
    expect(slugifyTag('Redução de Danos!')).toBe('reducao-de-danos');
  });

  it('collapses multiple separators', () => {
    expect(slugifyTag('  cultivo---outdoor  ')).toBe('cultivo-outdoor');
  });

  it('returns empty string when input has no letters', () => {
    expect(slugifyTag('!!!')).toBe('');
  });
});
