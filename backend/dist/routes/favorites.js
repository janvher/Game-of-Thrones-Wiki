import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { addFavorite, listFavorites, removeFavorite, } from '../services/favoritesService.js';
const router = Router();
router.use(requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const favorites = await listFavorites(req.user._id);
        res.json(favorites);
    }
    catch (err) {
        next(err);
    }
});
const addSchema = z.object({
    characterId: z.number().int().positive(),
});
router.post('/', async (req, res, next) => {
    try {
        const { characterId } = addSchema.parse(req.body);
        const favorite = await addFavorite(req.user._id, characterId);
        res.status(201).json(favorite);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'ALREADY_FAVORITE') {
            res.status(409).json({ error: 'Already in favorites' });
            return;
        }
        if (err instanceof Error && err.message === 'NOT_FOUND') {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        next(err);
    }
});
router.delete('/:characterId', async (req, res, next) => {
    try {
        const characterId = parseInt(req.params.characterId, 10);
        if (Number.isNaN(characterId)) {
            res.status(400).json({ error: 'Invalid character id' });
            return;
        }
        const removed = await removeFavorite(req.user._id, characterId);
        if (!removed) {
            res.status(404).json({ error: 'Favorite not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
export default router;
