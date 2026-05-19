import { Router } from 'express';
import { z } from 'zod';
import { PageView } from '../models/PageView.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const trackSchema = z.object({
  path: z.string().min(1).max(200),
});

router.post('/page-view', requireAuth, async (req, res, next) => {
  try {
    const { path } = trackSchema.parse(req.body);
    await PageView.create({ userId: req.user!._id, path });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const summary = await PageView.aggregate([
      { $match: { userId: req.user!._id } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(
      summary.map((s) => ({ path: s._id as string, views: s.count as number })),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
