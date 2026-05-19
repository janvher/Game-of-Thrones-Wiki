import type { Types } from 'mongoose';
export declare function getVapidPublicKey(): string | null;
export declare function saveSubscription(userId: Types.ObjectId, subscription: {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}): Promise<void>;
export declare function removeSubscription(userId: Types.ObjectId, endpoint: string): Promise<void>;
export declare function sendPushToUser(userId: Types.ObjectId, payload: {
    title: string;
    body: string;
    url?: string;
}): Promise<void>;
export declare function sendTestPush(userId: Types.ObjectId): Promise<{
    sent: boolean;
    subscriptionCount: number;
}>;
