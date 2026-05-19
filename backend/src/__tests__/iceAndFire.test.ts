import { describe, it, expect } from 'vitest';
import { dedupeCharacterList, extractCharacterId } from '../services/iceAndFire.js';
import type { CharacterListItem } from '../services/iceAndFire.js';

describe('Ice and Fire helpers', () => {
  it('extracts numeric id from character url', () => {
    expect(extractCharacterId('https://anapioficeandfire.com/api/characters/583')).toBe(
      583,
    );
    expect(extractCharacterId('https://anapioficeandfire.com/api/characters/42/')).toBe(
      42,
    );
  });

  it('returns 0 for invalid url', () => {
    expect(extractCharacterId('invalid')).toBe(0);
  });

  it('dedupes page results by id and name', () => {
    const row = (id: number, name: string): CharacterListItem => ({
      id,
      name,
      gender: 'Unknown',
      culture: 'Unknown',
      born: 'Unknown',
      titles: [],
      tvSeries: [],
      playedBy: [],
      imageUrl: 'https://example.com/x.jpg',
    });

    const duped = [
      row(16, 'Margaery Tyrell'),
      row(27, 'Tywin Lannister'),
      row(16, 'Margaery Tyrell'),
      row(27, 'Tywin Lannister'),
      row(148, 'Arya Stark'),
    ];

    const unique = dedupeCharacterList(duped);
    expect(unique).toHaveLength(3);
    expect(unique.map((c) => c.id)).toEqual([16, 27, 148]);
  });
});
