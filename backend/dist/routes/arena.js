import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { forfeitBattle, getActiveBattle, getArenaProfile, getLeaderboard, startBattle, submitTurn, updateLoadout, } from '../services/arenaService.js';
const router = Router();
const loadoutSchema = z.object({
    houseBonus: z.string().max(50).nullable().optional(),
    trait: z.enum(['aggressive', 'defensive', 'balanced']).optional(),
});
const startSchema = z.object({
    mode: z.enum(['duel', 'team', 'tournament']),
    playerCharacterId: z.number().int().positive(),
    opponentCharacterId: z.number().int().positive().optional(),
    playerTeamIds: z.array(z.number().int().positive()).max(3).optional(),
});
const turnSchema = z.object({
    battleId: z.string().min(1),
    action: z.enum(['strike', 'defend', 'rally']),
});
router.get('/profile', requireAuth, async (req, res, next) => {
    try {
        res.json(await getArenaProfile(req.user._id));
    }
    catch (err) {
        next(err);
    }
});
router.get('/leaderboard', requireAuth, async (req, res, next) => {
    try {
        res.json(await getLeaderboard(15));
    }
    catch (err) {
        next(err);
    }
});
router.get('/battle/active', requireAuth, async (req, res, next) => {
    try {
        res.json(await getActiveBattle(req.user._id));
    }
    catch (err) {
        next(err);
    }
});
router.put('/loadout', requireAuth, async (req, res, next) => {
    try {
        const body = loadoutSchema.parse(req.body);
        res.json(await updateLoadout(req.user._id, body));
    }
    catch (err) {
        next(err);
    }
});
router.post('/battle/start', requireAuth, async (req, res, next) => {
    try {
        const body = startSchema.parse(req.body);
        res.json(await startBattle(req.user._id, body));
    }
    catch (err) {
        if (err.message === 'NO_OPPONENTS') {
            res.status(503).json({ error: 'Could not find arena opponents' });
            return;
        }
        next(err);
    }
});
router.post('/battle/turn', requireAuth, async (req, res, next) => {
    try {
        const { battleId, action } = turnSchema.parse(req.body);
        res.json(await submitTurn(req.user._id, battleId, action));
    }
    catch (err) {
        if (err.message === 'BATTLE_NOT_FOUND') {
            res.status(404).json({ error: 'No active battle' });
            return;
        }
        next(err);
    }
});
router.post('/battle/forfeit', requireAuth, async (req, res, next) => {
    try {
        const { battleId } = z.object({ battleId: z.string() }).parse(req.body);
        res.json(await forfeitBattle(req.user._id, battleId));
    }
    catch (err) {
        if (err.message === 'BATTLE_NOT_FOUND') {
            res.status(404).json({ error: 'No active battle' });
            return;
        }
        next(err);
    }
});
export default router;
