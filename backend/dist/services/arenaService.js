import { ArenaBattle } from '../models/ArenaBattle.js';
import { ArenaMatch } from '../models/ArenaMatch.js';
import { ArenaProfile } from '../models/ArenaProfile.js';
import { fetchCharacter } from './iceAndFire.js';
import { fetchPopularCharacters } from './popularCharacters.js';
import { computeFighterStats, toFighterState } from './combatStats.js';
import { resolveTurn } from './combatEngine.js';
import { sendPushToUser } from './pushNotifications.js';
const WIN_RATING = 25;
const LOSS_RATING = 15;
async function getOrCreateProfile(userId) {
    let profile = await ArenaProfile.findOne({ userId });
    if (!profile) {
        profile = await ArenaProfile.create({ userId });
    }
    return profile;
}
function fighterToBattle(stats) {
    const f = toFighterState(stats);
    return {
        characterId: f.characterId,
        name: f.name,
        imageUrl: f.imageUrl,
        culture: f.culture,
        house: f.house,
        attack: f.attack,
        defense: f.defense,
        maxHp: f.maxHp,
        hp: f.hp,
        status: f.status,
        buffs: { ...f.buffs },
    };
}
async function loadCharacter(id) {
    return fetchCharacter(id);
}
function loadoutFromProfile(profile) {
    return { houseBonus: profile.houseBonus, trait: profile.trait };
}
async function pickRandomOpponent(excludeIds) {
    const popular = await fetchPopularCharacters();
    const pool = popular.filter((c) => !excludeIds.includes(c.id));
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? popular[0];
    if (!pick)
        throw new Error('NO_OPPONENTS');
    return loadCharacter(pick.id);
}
export async function getArenaProfile(userId) {
    const profile = await getOrCreateProfile(userId);
    const recent = await ArenaMatch.find({ userId }).sort({ playedAt: -1 }).limit(10).lean();
    const rank = await ArenaProfile.countDocuments({ rating: { $gt: profile.rating } });
    return {
        rating: profile.rating,
        wins: profile.wins,
        losses: profile.losses,
        currentStreak: profile.currentStreak,
        bestStreak: profile.bestStreak,
        totalDamageDealt: profile.totalDamageDealt,
        tournamentWins: profile.tournamentWins,
        teamBattleWins: profile.teamBattleWins,
        rank: rank + 1,
        loadout: {
            houseBonus: profile.houseBonus,
            trait: profile.trait,
        },
        recentMatches: recent.map((m) => ({
            id: String(m._id),
            mode: m.mode,
            winnerSide: m.winnerSide,
            summary: m.summary,
            pointsEarned: m.pointsEarned,
            ratingAfter: m.ratingAfter,
            playedAt: m.playedAt.toISOString(),
        })),
    };
}
export async function updateLoadout(userId, data) {
    const profile = await getOrCreateProfile(userId);
    if (data.houseBonus !== undefined)
        profile.houseBonus = data.houseBonus;
    if (data.trait)
        profile.trait = data.trait;
    await profile.save();
    return { houseBonus: profile.houseBonus, trait: profile.trait };
}
export async function getLeaderboard(limit = 10) {
    const top = await ArenaProfile.find()
        .sort({ rating: -1 })
        .limit(limit)
        .populate('userId', 'name')
        .lean();
    return top.map((p, i) => {
        const user = p.userId;
        const name = typeof user === 'object' && user && 'name' in user ? user.name : 'Unknown';
        return {
            rank: i + 1,
            name,
            rating: p.rating,
            wins: p.wins,
            losses: p.losses,
            bestStreak: p.bestStreak,
        };
    });
}
export async function getActiveBattle(userId) {
    const battle = await ArenaBattle.findOne({ userId, status: 'active' }).lean();
    if (!battle)
        return null;
    return serializeBattle(battle);
}
function serializeBattle(battle) {
    return {
        id: String(battle._id),
        mode: battle.mode,
        status: battle.status,
        player: battle.player,
        opponent: battle.opponent,
        playerTeam: battle.playerTeam,
        opponentTeam: battle.opponentTeam,
        activePlayerTeamIndex: battle.activePlayerTeamIndex,
        activeOpponentTeamIndex: battle.activeOpponentTeamIndex,
        turnNumber: battle.turnNumber,
        log: battle.log,
        loadout: battle.loadout,
        tournament: battle.tournament,
        winnerSide: battle.winnerSide,
    };
}
export async function startBattle(userId, opts) {
    await ArenaBattle.deleteMany({ userId, status: 'active' });
    const profile = await getOrCreateProfile(userId);
    const loadout = loadoutFromProfile(profile);
    const playerChar = await loadCharacter(opts.playerCharacterId);
    const player = fighterToBattle(computeFighterStats(playerChar, loadout));
    let opponentChar;
    let playerTeam = [];
    let opponentTeam = [];
    let tournament;
    if (opts.mode === 'team') {
        const teamIds = opts.playerTeamIds?.slice(0, 3) ?? [opts.playerCharacterId];
        while (teamIds.length < 3) {
            const extra = await pickRandomOpponent([...teamIds, opts.playerCharacterId]);
            if (!teamIds.includes(extra.id))
                teamIds.push(extra.id);
            else
                break;
        }
        const playerChars = await Promise.all(teamIds.slice(0, 3).map((id) => loadCharacter(id)));
        playerTeam = playerChars.map((c) => fighterToBattle(computeFighterStats(c, loadout)));
        const oppIds = [];
        while (oppIds.length < 3) {
            const o = await pickRandomOpponent([...teamIds, ...oppIds]);
            if (!oppIds.includes(o.id))
                oppIds.push(o.id);
        }
        const oppChars = await Promise.all(oppIds.map((id) => loadCharacter(id)));
        opponentTeam = oppChars.map((c) => fighterToBattle(computeFighterStats(c)));
        opponentChar = oppChars[0];
    }
    else if (opts.mode === 'tournament') {
        const bracketIds = [];
        while (bracketIds.length < 3) {
            const o = await pickRandomOpponent([opts.playerCharacterId, ...bracketIds]);
            if (!bracketIds.includes(o.id))
                bracketIds.push(o.id);
        }
        tournament = { round: 1, bracketOpponentIds: bracketIds, currentOpponentIndex: 0 };
        opponentChar = await loadCharacter(bracketIds[0]);
    }
    else {
        opponentChar = opts.opponentCharacterId
            ? await loadCharacter(opts.opponentCharacterId)
            : await pickRandomOpponent([opts.playerCharacterId]);
    }
    const opponent = fighterToBattle(computeFighterStats(opponentChar));
    if (opts.mode === 'team' && playerTeam.length > 0) {
        const battle = await ArenaBattle.create({
            userId,
            mode: opts.mode,
            player: playerTeam[0],
            opponent: opponentTeam[0],
            playerTeam,
            opponentTeam,
            loadout,
            log: [`Team battle begins! ${playerTeam[0].name} enters the arena.`],
        });
        return serializeBattle(battle.toObject());
    }
    const battle = await ArenaBattle.create({
        userId,
        mode: opts.mode,
        player,
        opponent,
        playerTeam: opts.mode === 'team' ? playerTeam : [],
        opponentTeam: opts.mode === 'team' ? opponentTeam : [],
        tournament,
        loadout,
        log: [
            opts.mode === 'tournament'
                ? `Tournament Round 1 — ${player.name} vs ${opponent.name}!`
                : `${player.name} challenges ${opponent.name} in the Arena!`,
        ],
    });
    return serializeBattle(battle.toObject());
}
async function recordMatch(userId, battle, pointsEarned) {
    const profile = await getOrCreateProfile(userId);
    const won = battle.winnerSide === 'player';
    if (won) {
        profile.wins += 1;
        profile.currentStreak += 1;
        profile.bestStreak = Math.max(profile.bestStreak, profile.currentStreak);
        profile.rating += WIN_RATING + Math.min(10, battle.turnNumber);
        if (battle.mode === 'tournament')
            profile.tournamentWins += 1;
        if (battle.mode === 'team')
            profile.teamBattleWins += 1;
    }
    else {
        profile.losses += 1;
        profile.currentStreak = 0;
        profile.rating = Math.max(100, profile.rating - LOSS_RATING);
    }
    await profile.save();
    const playerIds = battle.playerTeam.length > 0
        ? battle.playerTeam.map((f) => f.characterId)
        : [battle.player.characterId];
    const opponentIds = battle.opponentTeam.length > 0
        ? battle.opponentTeam.map((f) => f.characterId)
        : [battle.opponent.characterId];
    const summary = battle.winnerSide === 'player'
        ? `${battle.player.name} defeated ${battle.opponent.name}`
        : `${battle.opponent.name} defeated ${battle.player.name}`;
    await ArenaMatch.create({
        userId,
        mode: battle.mode,
        playerCharacterIds: playerIds,
        opponentCharacterIds: opponentIds,
        winnerSide: battle.winnerSide,
        turns: battle.turnNumber,
        pointsEarned,
        ratingAfter: profile.rating,
        summary,
    });
    try {
        await sendPushToUser(userId, {
            title: won ? 'Arena victory!' : 'Arena defeat',
            body: `${summary} · Rating ${profile.rating}`,
            url: '/arena',
        });
    }
    catch {
        /* optional */
    }
    return { profile, pointsEarned, summary };
}
function sanitizeFighter(f) {
    const attack = Number(f.attack);
    const defense = Number(f.defense);
    const maxHp = Number(f.maxHp);
    const hpRaw = Number(f.hp);
    const safeMaxHp = Number.isFinite(maxHp) && maxHp > 0 ? maxHp : 80;
    const safeHp = Number.isFinite(hpRaw) ? Math.min(safeMaxHp, Math.max(0, hpRaw)) : safeMaxHp;
    return {
        characterId: Number(f.characterId) || 0,
        name: f.name ?? 'Unknown',
        imageUrl: f.imageUrl,
        culture: f.culture ?? 'Unknown',
        house: f.house ?? null,
        attack: Number.isFinite(attack) ? attack : 10,
        defense: Number.isFinite(defense) ? defense : 10,
        maxHp: safeMaxHp,
        hp: safeHp,
        status: f.status ?? 'Unknown',
        buffs: {
            defendActive: Boolean(f.buffs?.defendActive),
            rallyActive: Boolean(f.buffs?.rallyActive),
            damageReduction: Number(f.buffs?.damageReduction) || 0,
        },
    };
}
function cloneFighter(f) {
    return sanitizeFighter(f);
}
export async function submitTurn(userId, battleId, playerAction) {
    const battle = await ArenaBattle.findOne({ _id: battleId, userId, status: 'active' });
    if (!battle)
        throw new Error('BATTLE_NOT_FOUND');
    const player = cloneFighter(battle.player);
    const opponent = cloneFighter(battle.opponent);
    const result = resolveTurn(player, opponent, playerAction);
    battle.player = sanitizeFighter(result.player);
    battle.opponent = sanitizeFighter(result.opponent);
    battle.markModified('player');
    battle.markModified('opponent');
    battle.turnNumber += 1;
    let damageDealt = 0;
    for (const ev of result.events) {
        battle.log.push(ev.message);
        if (ev.actor === 'player')
            damageDealt += Number(ev.damage) || 0;
    }
    const profile = await getOrCreateProfile(userId);
    profile.totalDamageDealt = (Number(profile.totalDamageDealt) || 0) + damageDealt;
    await profile.save();
    let battleComplete = false;
    let matchResult = null;
    let tournamentAdvanced = false;
    let nextOpponent = null;
    if (result.winner) {
        if (battle.mode === 'team' && result.winner === 'player' && battle.opponentTeam.length > 0) {
            const nextOppIdx = battle.activeOpponentTeamIndex + 1;
            if (nextOppIdx < battle.opponentTeam.length) {
                battle.activeOpponentTeamIndex = nextOppIdx;
                battle.opponent = sanitizeFighter(battle.opponentTeam[nextOppIdx]);
                battle.markModified('opponent');
                battle.log.push(`Next opponent: ${battle.opponent.name} enters!`);
                const nextPlayerIdx = battle.activePlayerTeamIndex + 1;
                if (nextPlayerIdx < battle.playerTeam.length && battle.player.hp < battle.player.maxHp * 0.4) {
                    battle.activePlayerTeamIndex = nextPlayerIdx;
                    battle.player = sanitizeFighter(battle.playerTeam[nextPlayerIdx]);
                    battle.markModified('player');
                    battle.log.push(`${battle.player.name} tags in!`);
                }
            }
            else {
                battleComplete = true;
                battle.winnerSide = 'player';
            }
        }
        else if (battle.mode === 'team' && result.winner === 'opponent' && battle.playerTeam.length > 0) {
            const nextPIdx = battle.activePlayerTeamIndex + 1;
            if (nextPIdx < battle.playerTeam.length) {
                battle.activePlayerTeamIndex = nextPIdx;
                battle.player = sanitizeFighter(battle.playerTeam[nextPIdx]);
                battle.markModified('player');
                battle.log.push(`${battle.player.name} replaces the fallen!`);
            }
            else {
                battleComplete = true;
                battle.winnerSide = 'opponent';
            }
        }
        else if (battle.mode === 'tournament' &&
            result.winner === 'player' &&
            battle.tournament &&
            battle.tournament.currentOpponentIndex < battle.tournament.bracketOpponentIds.length - 1) {
            battle.tournament.currentOpponentIndex += 1;
            battle.tournament.round += 1;
            const nextId = battle.tournament.bracketOpponentIds[battle.tournament.currentOpponentIndex];
            const nextChar = await loadCharacter(nextId);
            nextOpponent = fighterToBattle(computeFighterStats(nextChar));
            battle.opponent = sanitizeFighter(nextOpponent);
            battle.markModified('opponent');
            const heal = Math.floor(battle.player.maxHp * 0.15);
            battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + heal);
            battle.markModified('player');
            battle.log.push(`Round ${battle.tournament.round} — ${battle.opponent.name} steps forward!`);
            tournamentAdvanced = true;
        }
        else {
            battleComplete = true;
            battle.winnerSide = result.winner;
        }
    }
    let pointsEarned = 0;
    if (battleComplete && battle.winnerSide) {
        const winnerSide = battle.winnerSide;
        pointsEarned =
            winnerSide === 'player'
                ? 50 + battle.turnNumber * 2 + (battle.mode === 'tournament' ? 80 : battle.mode === 'team' ? 40 : 0)
                : 5;
        matchResult = await recordMatch(userId, {
            mode: battle.mode,
            player: battle.player,
            opponent: battle.opponent,
            playerTeam: battle.playerTeam,
            opponentTeam: battle.opponentTeam,
            turnNumber: battle.turnNumber,
            winnerSide,
        }, pointsEarned);
        battle.status = 'complete';
    }
    await battle.save();
    return {
        battle: serializeBattle(battle.toObject()),
        events: result.events,
        battleComplete,
        tournamentAdvanced,
        matchResult: matchResult
            ? {
                winnerSide: battle.winnerSide,
                pointsEarned,
                rating: matchResult.profile.rating,
                summary: matchResult.summary,
            }
            : null,
    };
}
export async function forfeitBattle(userId, battleId) {
    const battle = await ArenaBattle.findOne({ _id: battleId, userId, status: 'active' });
    if (!battle)
        throw new Error('BATTLE_NOT_FOUND');
    battle.winnerSide = 'opponent';
    battle.status = 'complete';
    const matchResult = await recordMatch(userId, {
        mode: battle.mode,
        player: battle.player,
        opponent: battle.opponent,
        playerTeam: battle.playerTeam,
        opponentTeam: battle.opponentTeam,
        turnNumber: battle.turnNumber,
        winnerSide: 'opponent',
    }, 0);
    await battle.save();
    return {
        battle: serializeBattle(battle.toObject()),
        matchResult: {
            winnerSide: 'opponent',
            pointsEarned: 0,
            rating: matchResult.profile.rating,
            summary: matchResult.summary,
        },
    };
}
