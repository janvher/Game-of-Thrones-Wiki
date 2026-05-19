import mongoose, { Schema, type Document, type Model } from 'mongoose';
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
  loadout: { houseBonus: string | null; trait: LoadoutTrait };
  tournament?: ITournamentState;
  winnerSide: 'player' | 'opponent' | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IArenaBattleDocument = IArenaBattle & Document;

const fighterSchema = new Schema<IBattleFighter>(
  {
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
  },
  { _id: false },
);

const arenaBattleSchema = new Schema<IArenaBattleDocument>(
  {
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
  },
  { timestamps: true },
);

arenaBattleSchema.index({ userId: 1, status: 1 });

export const ArenaBattle: Model<IArenaBattleDocument> =
  mongoose.models.ArenaBattle ??
  mongoose.model<IArenaBattleDocument>('ArenaBattle', arenaBattleSchema);
