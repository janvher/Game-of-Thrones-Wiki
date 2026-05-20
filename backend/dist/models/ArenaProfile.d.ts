import mongoose, { type Document, type Model } from 'mongoose';
export type LoadoutTrait = 'aggressive' | 'defensive' | 'balanced';
export interface IArenaProfile {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number;
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
    totalDamageDealt: number;
    tournamentWins: number;
    teamBattleWins: number;
    houseBonus: string | null;
    trait: LoadoutTrait;
    updatedAt: Date;
    createdAt: Date;
}
export type IArenaProfileDocument = IArenaProfile & Document;
export declare const ArenaProfile: Model<IArenaProfileDocument>;
