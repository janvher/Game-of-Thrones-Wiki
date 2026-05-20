import { describe, expect, it } from 'vitest';
import { inferHouse, uniqueHousesFromFavorites } from '../utils/houseUtils.js';

describe('houseUtils', () => {
  it('infers house from titles', () => {
    expect(inferHouse({ name: 'Eddard Stark', culture: 'Northmen', titles: [] })).toBe('Stark');
  });

  it('collects unique houses from favorites', () => {
    const houses = uniqueHousesFromFavorites([
      {
        characterName: 'Eddard Stark',
        characterData: { culture: 'Northmen', titles: [] },
      },
      {
        characterName: 'Tyrion Lannister',
        characterData: { culture: '', titles: ['Son of Tywin'] },
      },
    ]);
    expect(houses).toContain('Stark');
    expect(houses).toContain('Lannister');
  });
});
