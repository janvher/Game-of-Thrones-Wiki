import type { ArenaAction } from './combatStats.js';
import type { FighterState } from './combatStats.js';

export interface BattleEvent {
  actor: 'player' | 'opponent';
  action: ArenaAction;
  damage: number;
  message: string;
}

function rollVariance(): number {
  return Math.floor(Math.random() * 5) - 2;
}

function calcDamage(attacker: FighterState, defender: FighterState, action: ArenaAction): number {
  if (action === 'defend') return 0;

  const atk = Number(attacker.attack) || 10;
  const def = Number(defender.defense) || 10;

  let power = atk + rollVariance();
  if (action === 'rally' && attacker.buffs.rallyActive) {
    power = Math.floor(power * 1.45);
  }
  if (attacker.buffs.rallyActive && action === 'strike') {
    power = Math.floor(power * 1.25);
    attacker.buffs.rallyActive = false;
  }

  let mitigation = def * 0.35;
  if (defender.buffs?.defendActive) {
    mitigation += def * 0.4;
    defender.buffs.defendActive = false;
  }
  mitigation += Number(defender.buffs?.damageReduction) || 0;
  if (defender.buffs) defender.buffs.damageReduction = 0;

  const damage = Math.max(3, Math.floor(power - mitigation));
  return Number.isFinite(damage) ? damage : 3;
}

function pickAiAction(self: FighterState, foe: FighterState): ArenaAction {
  const maxHp = Number(self.maxHp) || 1;
  const hpRatio = (Number(self.hp) || 0) / maxHp;
  if (hpRatio < 0.3 && Math.random() < 0.45) return 'defend';
  if (!self.buffs?.rallyActive && hpRatio > 0.5 && Math.random() < 0.3) return 'rally';
  if (foe.buffs?.defendActive && Math.random() < 0.35) return 'rally';
  return 'strike';
}

function applyActionPrep(fighter: FighterState, action: ArenaAction): void {
  if (!fighter.buffs) {
    fighter.buffs = { defendActive: false, rallyActive: false, damageReduction: 0 };
  }
  const maxHp = Number(fighter.maxHp) || 80;
  const hp = Number(fighter.hp) || 0;
  fighter.maxHp = maxHp;
  fighter.hp = hp;

  if (action === 'defend') {
    fighter.buffs.defendActive = true;
    const heal = Math.floor(maxHp * 0.06);
    fighter.hp = Math.min(maxHp, hp + heal);
  } else if (action === 'rally') {
    fighter.buffs.rallyActive = true;
  }
}

function actionLabel(action: ArenaAction): string {
  if (action === 'strike') return 'Strike';
  if (action === 'defend') return 'Defend';
  return 'Rally';
}

export function resolveTurn(
  player: FighterState,
  opponent: FighterState,
  playerAction: ArenaAction,
): { events: BattleEvent[]; player: FighterState; opponent: FighterState; winner: 'player' | 'opponent' | null } {
  const events: BattleEvent[] = [];
  const aiAction = pickAiAction(opponent, player);

  const playerFirst = playerAction !== 'defend' || aiAction === 'strike';

  const turns: Array<{ actor: 'player' | 'opponent'; action: ArenaAction }> = playerFirst
    ? [
        { actor: 'player', action: playerAction },
        { actor: 'opponent', action: aiAction },
      ]
    : [
        { actor: 'opponent', action: aiAction },
        { actor: 'player', action: playerAction },
      ];

  for (const turn of turns) {
    const isPlayer = turn.actor === 'player';
    const actor = isPlayer ? player : opponent;
    const target = isPlayer ? opponent : player;

    if (actor.hp <= 0) continue;

    applyActionPrep(actor, turn.action);

    if (turn.action === 'strike' || (turn.action === 'rally' && actor.buffs.rallyActive)) {
      const dmgAction = turn.action === 'rally' && !actor.buffs.rallyActive ? 'strike' : turn.action;
      const damage = calcDamage(actor, target, dmgAction === 'rally' ? 'strike' : dmgAction);
      if (turn.action === 'rally' && damage === 0) {
        events.push({
          actor: turn.actor,
          action: turn.action,
          damage: 0,
          message: `${actor.name} rallies — next strike empowered!`,
        });
      } else {
        const targetHp = Number(target.hp) || 0;
        target.hp = Math.max(0, targetHp - damage);
        events.push({
          actor: turn.actor,
          action: turn.action,
          damage,
          message: `${actor.name} uses ${actionLabel(turn.action)} — ${damage} damage to ${target.name}!`,
        });
      }
    } else if (turn.action === 'defend') {
      events.push({
        actor: turn.actor,
        action: turn.action,
        damage: 0,
        message: `${actor.name} defends and recovers footing.`,
      });
    } else if (turn.action === 'rally') {
      events.push({
        actor: turn.actor,
        action: turn.action,
        damage: 0,
        message: `${actor.name} rallies the troops!`,
      });
    }

    if (target.hp <= 0) break;
  }

  let winner: 'player' | 'opponent' | null = null;
  if (opponent.hp <= 0) winner = 'player';
  else if (player.hp <= 0) winner = 'opponent';

  return { events, player, opponent, winner };
}
