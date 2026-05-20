import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCourtBriefing, getCourtProgress, getRealmInsights } from '../services/courtService.js';

const router = Router();

router.get('/progress', requireAuth, async (req, res, next) => {
  try {
    const progress = await getCourtProgress(req.user!._id);
    res.json(progress);
  } catch (err) {
    next(err);
  }
});

router.get('/briefing', requireAuth, async (req, res, next) => {
  try {
    const briefing = await getCourtBriefing(req.user!._id, req.user!.name);
    res.json(briefing);
  } catch (err) {
    next(err);
  }
});

router.get('/realm-insights', requireAuth, async (req, res, next) => {
  try {
    const insights = await getRealmInsights(req.user!._id);
    res.json(insights);
  } catch (err) {
    next(err);
  }
});

export default router;
