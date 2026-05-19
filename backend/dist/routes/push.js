import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { getVapidPublicKey, removeSubscription, saveSubscription, sendTestPush, } from '../services/pushNotifications.js';
const router = Router();
router.get('/vapid-public-key', (_req, res) => {
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
        res.status(503).json({ error: 'Push notifications not configured' });
        return;
    }
    res.json({ publicKey });
});
const subscribeSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
    }),
});
router.post('/subscribe', requireAuth, async (req, res, next) => {
    try {
        const body = subscribeSchema.parse(req.body);
        await saveSubscription(req.user._id, body);
        res.status(201).json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.post('/unsubscribe', requireAuth, async (req, res, next) => {
    try {
        const { endpoint } = z.object({ endpoint: z.string().url() }).parse(req.body);
        await removeSubscription(req.user._id, endpoint);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
router.post('/test', requireAuth, async (req, res, next) => {
    try {
        if (!getVapidPublicKey()) {
            res.status(503).json({ error: 'Push notifications not configured on server' });
            return;
        }
        const result = await sendTestPush(req.user._id);
        if (result.subscriptionCount === 0) {
            res.status(400).json({
                error: 'No push subscription found. Click “Enable push notifications” first.',
            });
            return;
        }
        res.json({ ok: result.sent, subscriptionCount: result.subscriptionCount });
    }
    catch (err) {
        next(err);
    }
});
export default router;
