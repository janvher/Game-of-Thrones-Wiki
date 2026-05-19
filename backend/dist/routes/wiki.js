import { Router } from 'express';
import { z } from 'zod';
import { fetchLatestHubPosts, fetchLoreFeed } from '../services/wikiofthrones.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
const pageSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(20).default(10),
});
router.get('/lore', async (req, res, next) => {
    try {
        const { page, perPage } = pageSchema.parse(req.query);
        const articles = await fetchLoreFeed(page, perPage);
        res.json(articles);
    }
    catch (err) {
        next(err);
    }
});
router.get('/hub', async (req, res, next) => {
    try {
        const { perPage } = pageSchema.parse(req.query);
        const articles = await fetchLatestHubPosts(perPage);
        res.json(articles);
    }
    catch (err) {
        next(err);
    }
});
export default router;
