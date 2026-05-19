import { type IBattleFighter } from '../models/ArenaBattle.js';
import { type LoadoutTrait } from '../models/ArenaProfile.js';
import { type ArenaAction } from './combatStats.js';
import type { Types } from 'mongoose';
export declare function getArenaProfile(userId: Types.ObjectId): Promise<{
    rating: number;
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
    totalDamageDealt: number;
    tournamentWins: number;
    teamBattleWins: number;
    rank: number;
    loadout: {
        houseBonus: string | null;
        trait: LoadoutTrait;
    };
    recentMatches: {
        id: string;
        mode: "duel" | "team" | "tournament";
        winnerSide: "player" | "opponent";
        summary: string;
        pointsEarned: number;
        ratingAfter: number;
        playedAt: string;
    }[];
}>;
export declare function updateLoadout(userId: Types.ObjectId, data: {
    houseBonus?: string | null;
    trait?: LoadoutTrait;
}): Promise<{
    houseBonus: string | null;
    trait: LoadoutTrait;
}>;
export declare function getLeaderboard(limit?: number): Promise<{
    rank: number;
    name: string | undefined;
    rating: number;
    wins: number;
    losses: number;
    bestStreak: number;
}[]>;
export declare function getActiveBattle(userId: Types.ObjectId): Promise<{
    id: string;
    mode: string;
    status: string;
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
    tournament: {
        round: number;
        bracketOpponentIds: number[];
        currentOpponentIndex: number;
    } | undefined;
    winnerSide: string | null;
} | null>;
export declare function startBattle(userId: Types.ObjectId, opts: {
    mode: 'duel' | 'team' | 'tournament';
    playerCharacterId: number;
    opponentCharacterId?: number;
    playerTeamIds?: number[];
}): Promise<{
    id: string;
    mode: string;
    status: string;
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
    tournament: {
        round: number;
        bracketOpponentIds: number[];
        currentOpponentIndex: number;
    } | undefined;
    winnerSide: string | null;
}>;
export declare function submitTurn(userId: Types.ObjectId, battleId: string, playerAction: ArenaAction): Promise<{
    battle: {
        id: string;
        mode: string;
        status: string;
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
        tournament: {
            round: number;
            bracketOpponentIds: number[];
            currentOpponentIndex: number;
        } | undefined;
        winnerSide: string | null;
    };
    events: import("./combatEngine.js").BattleEvent[];
    battleComplete: boolean;
    tournamentAdvanced: boolean;
    matchResult: {
        winnerSide: "player" | "opponent" | null;
        pointsEarned: number;
        rating: number;
        summary: string;
    } | null;
}>;
export declare function forfeitBattle(userId: Types.ObjectId, battleId: string): Promise<{
    battle: {
        id: string;
        mode: string;
        status: string;
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
        tournament: {
            round: number;
            bracketOpponentIds: number[];
            currentOpponentIndex: number;
        } | undefined;
        winnerSide: string | null;
    };
    matchResult: {
        winnerSide: "opponent";
        pointsEarned: number;
        rating: number;
        summary: string;
    };
}>;
