import webpush from 'web-push';
import { config } from '../config.js';
import { PushSubscription } from '../models/PushSubscription.js';
let vapidReady = false;
function initVapid() {
    if (vapidReady)
        return true;
    if (!config.vapidPublicKey || !config.vapidPrivateKey) {
        return false;
    }
    webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);
    vapidReady = true;
    return true;
}
export function getVapidPublicKey() {
    return config.vapidPublicKey || null;
}
export async function saveSubscription(userId, subscription) {
    await PushSubscription.findOneAndUpdate({ userId, endpoint: subscription.endpoint }, {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
    }, { upsert: true, new: true });
}
export async function removeSubscription(userId, endpoint) {
    await PushSubscription.deleteOne({ userId, endpoint });
}
export async function sendPushToUser(userId, payload) {
    if (!initVapid())
        return;
    const subs = await PushSubscription.find({ userId });
    const data = JSON.stringify(payload);
    await Promise.allSettled(subs.map(async (sub) => {
        try {
            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys,
            }, data);
        }
        catch (err) {
            const status = err.statusCode;
            if (status === 404 || status === 410) {
                await PushSubscription.deleteOne({ _id: sub._id });
            }
        }
    }));
}
export async function sendTestPush(userId) {
    if (!initVapid()) {
        return { sent: false, subscriptionCount: 0 };
    }
    const count = await PushSubscription.countDocuments({ userId });
    if (count === 0) {
        return { sent: false, subscriptionCount: 0 };
    }
    await sendPushToUser(userId, {
        title: 'Umpisa Inc - Jan Genvher Papica Exam',
        body: 'Push notifications are working. Winter is coming.',
        url: '/dashboard',
    });
    return { sent: true, subscriptionCount: count };
}
