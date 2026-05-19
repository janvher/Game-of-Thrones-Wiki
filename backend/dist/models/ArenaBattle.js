import mongoose, { Schema } from 'mongoose';
const fighterSchema = new Schema({
    characterId: Number,
    name: String,
    imageUrl: String,
    culture: String,
    house: String,
    attack: Number,
    defense: Number,
    maxHp: Number,
    hp: Number,
    status: String,
    buffs: {
        defendActive: { type: Boolean, default: false },
        rallyActive: { type: Boolean, default: false },
        damageReduction: { type: Number, default: 0 },
    },
}, { _id: false });
const arenaBattleSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: { type: String, enum: ['duel', 'team', 'tournament'], required: true },
    status: { type: String, enum: ['active', 'complete'], default: 'active' },
    player: { type: fighterSchema, required: true },
    opponent: { type: fighterSchema, required: true },
    playerTeam: { type: [fighterSchema], default: [] },
    opponentTeam: { type: [fighterSchema], default: [] },
    activePlayerTeamIndex: { type: Number, default: 0 },
    activeOpponentTeamIndex: { type: Number, default: 0 },
    turnNumber: { type: Number, default: 0 },
    log: { type: [String], default: [] },
    loadout: {
        houseBonus: { type: String, default: null },
        trait: { type: String, enum: ['aggressive', 'defensive', 'balanced'], default: 'balanced' },
    },
    tournament: {
        round: Number,
        bracketOpponentIds: [Number],
        currentOpponentIndex: Number,
    },
    winnerSide: { type: String, enum: ['player', 'opponent', null], default: null },
}, { timestamps: true });
arenaBattleSchema.index({ userId: 1, status: 1 });
export const ArenaBattle = mongoose.models.ArenaBattle ??
    mongoose.model('ArenaBattle', arenaBattleSchema);
