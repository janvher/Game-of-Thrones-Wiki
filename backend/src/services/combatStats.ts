import { inferHouse } from '../utils/houseUtils.js';
import type { CharacterDetail } from './iceAndFire.js';

export type ArenaAction = 'strike' | 'defend' | 'rally';
export type LoadoutTrait = 'aggressive' | 'defensive' | 'balanced';

export interface FighterStats {
  characterId: number;
  name: string;
  imageUrl?: string;
  culture: string;
  house: string | null;
  attack: number;
  defense: number;
  maxHp: number;
  hp: number;
  status: string;
}

export interface FighterBuffs {
  defendActive: boolean;
  rallyActive: boolean;
  damageReduction: number;
}

export function computeFighterStats(
  character: CharacterDetail,
  loadout?: { houseBonus?: string | null; trait?: LoadoutTrait },
): FighterStats {
  const house = inferHouse({
    name: character.name,
    culture: character.culture,
    titles: character.titles,
    allegiances: character.allegiances,
  });

  const tvBonus = character.tvSeries.length * 3;
  const titleBonus = character.titles.filter(Boolean).length * 2;
  const aliveBonus = character.status === 'Alive' ? 8 : character.status === 'Deceased' ? -2 : 0;
  const bookBonus = Math.min(character.books.length, 5);

  let attack = 12 + tvBonus + titleBonus + aliveBonus + bookBonus;
  let defense = 10 + Math.floor(tvBonus / 2) + titleBonus;

  if (loadout?.trait === 'aggressive') {
    attack += 6;
    defense -= 2;
  } else if (loadout?.trait === 'defensive') {
    attack -= 2;
    defense += 8;
  }

  if (loadout?.houseBonus && house && house.toLowerCase() === loadout.houseBonus.toLowerCase()) {
    attack += 5;
    defense += 3;
  }

  attack = Math.max(8, attack);
  defense = Math.max(6, defense);
  const maxHp = 80 + Math.floor(attack * 1.2) + defense;

  return {
    characterId: character.id,
    name: character.name,
    imageUrl: character.imageUrl,
    culture: character.culture,
    house,
    attack,
    defense,
    maxHp,
    hp: maxHp,
    status: character.status,
  };
}

export function toFighterState(
  stats: FighterStats,
  buffs: FighterBuffs = { defendActive: false, rallyActive: false, damageReduction: 0 },
) {
  return { ...stats, buffs };
}

export type FighterState = FighterStats & { buffs: FighterBuffs };
