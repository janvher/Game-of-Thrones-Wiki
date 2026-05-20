import mongoose, { Schema } from 'mongoose';
const arenaMatchSchema = new Schema({
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
}, { timestamps: false });
arenaMatchSchema.index({ userId: 1, playedAt: -1 });
export const ArenaMatch = mongoose.models.ArenaMatch ?? mongoose.model('ArenaMatch', arenaMatchSchema);
