import { describe, it, expect } from 'vitest';
import { cleanRenderedText, decodeHtmlEntities } from '../utils/text.js';
import { deriveCharacterStatus } from '../utils/characterStatus.js';

describe('text utils', () => {
  it('decodes numeric HTML entities', () => {
    expect(decodeHtmlEntities('Jon&#8217;s quest')).not.toContain('&#8217');
    expect(decodeHtmlEntities('Jon&#8217;s quest')).toContain('Jon');
    expect(decodeHtmlEntities('it&#8217s fine')).not.toContain('&#8217');
  });

  it('strips tags and decodes excerpt text', () => {
    const text = cleanRenderedText('<p>House Stark&#8217;s heir</p>');
    expect(text).toBe('House Stark\u2019s heir');
    expect(text).not.toContain('&#8217');
  });
});

describe('deriveCharacterStatus', () => {
  it('marks TV characters without death date as alive when alive is null', () => {
    expect(
      deriveCharacterStatus(null, '—', ['Season 1', 'Season 2']),
    ).toBe('Alive');
  });

  it('marks characters with a died field as deceased', () => {
    expect(deriveCharacterStatus(null, 'In 298 AC, at Dothraki sea', [])).toBe(
      'Deceased',
    );
  });

  it('respects explicit alive flag', () => {
    expect(deriveCharacterStatus(false, '', ['Season 1'])).toBe('Deceased');
    expect(deriveCharacterStatus(true, 'In 300 AC', [])).toBe('Alive');
  });
});
