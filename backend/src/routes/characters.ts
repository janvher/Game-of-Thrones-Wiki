import { Router } from 'express';
import { z } from 'zod';
import { fetchCharacter, fetchCharacters } from '../services/iceAndFire.js';
import { searchArticlesForCharacter } from '../services/wikiofthrones.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(9),
  search: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { page, pageSize, search } = listQuerySchema.parse(req.query);
    const data = await fetchCharacters(page, pageSize, search);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (req.params.id === 'popular') {
      res.status(400).json({
        error: 'Use GET /api/characters/popular for the popular roster',
      });
      return;
    }

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid character id' });
      return;
    }
    const character = await fetchCharacter(id);
    const wikiArticles = await searchArticlesForCharacter(character.name);
    res.json({ ...character, wikiArticles });
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    next(err);
  }
});

export default router;
