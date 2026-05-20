function rollVariance() {
    return Math.floor(Math.random() * 5) - 2;
}
function calcDamage(attacker, defender, action) {
    if (action === 'defend')
        return 0;
    let power = attacker.attack + rollVariance();
    if (action === 'rally' && attacker.buffs.rallyActive) {
        power = Math.floor(power * 1.45);
    }
    if (attacker.buffs.rallyActive && action === 'strike') {
        power = Math.floor(power * 1.25);
        attacker.buffs.rallyActive = false;
    }
    let mitigation = defender.defense * 0.35;
    if (defender.buffs.defendActive) {
        mitigation += defender.defense * 0.4;
        defender.buffs.defendActive = false;
    }
    mitigation += defender.buffs.damageReduction;
    defender.buffs.damageReduction = 0;
    return Math.max(3, Math.floor(power - mitigation));
}
function pickAiAction(self, foe) {
    const hpRatio = self.hp / self.maxHp;
    if (hpRatio < 0.3 && Math.random() < 0.45)
        return 'defend';
    if (self.buffs.rallyActive === false && hpRatio > 0.5 && Math.random() < 0.3)
        return 'rally';
    if (foe.buffs.defendActive && Math.random() < 0.35)
        return 'rally';
    return 'strike';
}
function applyActionPrep(fighter, action) {
    if (action === 'defend') {
        fighter.buffs.defendActive = true;
        const heal = Math.floor(fighter.maxHp * 0.06);
        fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
    }
    else if (action === 'rally') {
        fighter.buffs.rallyActive = true;
    }
}
function actionLabel(action) {
    if (action === 'strike')
        return 'Strike';
    if (action === 'defend')
        return 'Defend';
    return 'Rally';
}
export function resolveTurn(player, opponent, playerAction) {
    const events = [];
    const aiAction = pickAiAction(opponent, player);
    const playerFirst = playerAction !== 'defend' || aiAction === 'strike';
    const turns = playerFirst
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
        if (actor.hp <= 0)
            continue;
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
            }
            else {
                target.hp = Math.max(0, target.hp - damage);
                events.push({
                    actor: turn.actor,
                    action: turn.action,
                    damage,
                    message: `${actor.name} uses ${actionLabel(turn.action)} — ${damage} damage to ${target.name}!`,
                });
            }
        }
        else if (turn.action === 'defend') {
            events.push({
                actor: turn.actor,
                action: turn.action,
                damage: 0,
                message: `${actor.name} defends and recovers footing.`,
            });
        }
        else if (turn.action === 'rally') {
            events.push({
                actor: turn.actor,
                action: turn.action,
                damage: 0,
                message: `${actor.name} rallies the troops!`,
            });
        }
        if (target.hp <= 0)
            break;
    }
    let winner = null;
    if (opponent.hp <= 0)
        winner = 'player';
    else if (player.hp <= 0)
        winner = 'opponent';
    return { events, player, opponent, winner };
}
