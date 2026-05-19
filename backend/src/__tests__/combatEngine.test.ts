import { describe, expect, it } from 'vitest';
import { computeFighterStats } from '../services/combatStats.js';
import { resolveTurn } from '../services/combatEngine.js';
import type { CharacterDetail } from '../services/iceAndFire.js';

const mockChar: CharacterDetail = {
  id: 1,
  name: 'Test Stark',
  gender: 'Male',
  culture: 'Northmen',
  born: '',
  titles: ['Lord'],
  tvSeries: ['Season 1'],
  playedBy: [],
  died: '—',
  alive: true,
  status: 'Alive',
  aliases: [],
  allegiances: [],
  books: ['A Game of Thrones'],
  povBooks: [],
};

describe('combatEngine', () => {
  it('computes positive stats', () => {
    const stats = computeFighterStats(mockChar);
    expect(stats.attack).toBeGreaterThan(0);
    expect(stats.maxHp).toBeGreaterThan(50);
  });

  it('handles undefined stats without NaN damage', () => {
    const a = {
      ...computeFighterStats(mockChar),
      attack: undefined as unknown as number,
      defense: undefined as unknown as number,
      buffs: { defendActive: false, rallyActive: false, damageReduction: 0 },
    };
    const b = {
      ...computeFighterStats(mockChar),
      id: 2,
      buffs: { defendActive: false, rallyActive: false, damageReduction: 0 },
    };
    const result = resolveTurn(a, b, 'strike');
    expect(Number.isFinite(result.events[0]?.damage ?? 0)).toBe(true);
    expect(Number.isFinite(result.player.hp)).toBe(true);
  });

  it('resolves a turn without crashing', () => {
    const a = computeFighterStats(mockChar);
    const b = computeFighterStats({ ...mockChar, id: 2, name: 'Test Lannister', culture: 'Westerlands' });
    const result = resolveTurn(
      { ...a, buffs: { defendActive: false, rallyActive: false, damageReduction: 0 } },
      { ...b, buffs: { defendActive: false, rallyActive: false, damageReduction: 0 } },
      'strike',
    );
    expect(result.events.length).toBeGreaterThan(0);
  });
});
