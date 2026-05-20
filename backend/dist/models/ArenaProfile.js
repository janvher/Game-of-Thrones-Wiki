import mongoose, { Schema } from 'mongoose';
const arenaProfileSchema = new Schema({
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
}, { timestamps: true });
export const ArenaProfile = mongoose.models.ArenaProfile ??
    mongoose.model('ArenaProfile', arenaProfileSchema);
