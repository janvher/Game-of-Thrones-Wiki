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
export declare function computeFighterStats(character: CharacterDetail, loadout?: {
    houseBonus?: string | null;
    trait?: LoadoutTrait;
}): FighterStats;
export declare function toFighterState(stats: FighterStats, buffs?: FighterBuffs): {
    buffs: FighterBuffs;
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
};
export type FighterState = FighterStats & {
    buffs: FighterBuffs;
};
