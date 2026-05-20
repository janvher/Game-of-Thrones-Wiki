import mongoose, { Schema, type Document, type Model } from 'mongoose';

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

const arenaProfileSchema = new Schema<IArenaProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    rating: { type: Number, default: 1000 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    tournamentWins: { type: Number, default: 0 },
    teamBattleWins: { type: Number, default: 0 },
    houseBonus: { type: String, default: null },
    trait: { type: String, enum: ['aggressive', 'defensive', 'balanced'], default: 'balanced' },
  },
  { timestamps: true },
);

export const ArenaProfile: Model<IArenaProfileDocument> =
  mongoose.models.ArenaProfile ??
  mongoose.model<IArenaProfileDocument>('ArenaProfile', arenaProfileSchema);
