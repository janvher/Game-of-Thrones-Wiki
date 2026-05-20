import mongoose, { type Document, type Model } from 'mongoose';
export interface IArenaMatch {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mode: 'duel' | 'team' | 'tournament';
    playerCharacterIds: number[];
    opponentCharacterIds: number[];
    winnerSide: 'player' | 'opponent';
    turns: number;
    pointsEarned: number;
    ratingAfter: number;
    summary: string;
    playedAt: Date;
}
export type IArenaMatchDocument = IArenaMatch & Document;
export declare const ArenaMatch: Model<IArenaMatchDocument>;
