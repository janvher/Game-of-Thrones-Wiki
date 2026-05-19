import mongoose, { type Document, type Model } from 'mongoose';
import type { LoadoutTrait } from './ArenaProfile.js';
export interface IBattleFighter {
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
    buffs: {
        defendActive: boolean;
        rallyActive: boolean;
        damageReduction: number;
    };
}
export interface ITournamentState {
    round: number;
    bracketOpponentIds: number[];
    currentOpponentIndex: number;
}
export interface IArenaBattle {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mode: 'duel' | 'team' | 'tournament';
    status: 'active' | 'complete';
    player: IBattleFighter;
    opponent: IBattleFighter;
    playerTeam: IBattleFighter[];
    opponentTeam: IBattleFighter[];
    activePlayerTeamIndex: number;
    activeOpponentTeamIndex: number;
    turnNumber: number;
    log: string[];
    loadout: {
        houseBonus: string | null;
        trait: LoadoutTrait;
    };
    tournament?: ITournamentState;
    winnerSide: 'player' | 'opponent' | null;
    createdAt: Date;
    updatedAt: Date;
}
export type IArenaBattleDocument = IArenaBattle & Document;
export declare const ArenaBattle: Model<IArenaBattleDocument>;
