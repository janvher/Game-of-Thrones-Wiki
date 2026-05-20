import type { ArenaAction } from './combatStats.js';
import type { FighterState } from './combatStats.js';
export interface BattleEvent {
    actor: 'player' | 'opponent';
    action: ArenaAction;
    damage: number;
    message: string;
}
export declare function resolveTurn(player: FighterState, opponent: FighterState, playerAction: ArenaAction): {
    events: BattleEvent[];
    player: FighterState;
    opponent: FighterState;
    winner: 'player' | 'opponent' | null;
};
