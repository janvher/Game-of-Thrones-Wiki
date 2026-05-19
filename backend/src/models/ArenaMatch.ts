import mongoose, { Schema, type Document, type Model } from 'mongoose';

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

const arenaMatchSchema = new Schema<IArenaMatchDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: { type: String, enum: ['duel', 'team', 'tournament'], required: true },
    playerCharacterIds: [{ type: Number }],
    opponentCharacterIds: [{ type: Number }],
    winnerSide: { type: String, enum: ['player', 'opponent'], required: true },
    turns: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    ratingAfter: { type: Number, default: 1000 },
    summary: { type: String, default: '' },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

arenaMatchSchema.index({ userId: 1, playedAt: -1 });

export const ArenaMatch: Model<IArenaMatchDocument> =
  mongoose.models.ArenaMatch ?? mongoose.model<IArenaMatchDocument>('ArenaMatch', arenaMatchSchema);
