import mongoose, { type Document, type Model } from 'mongoose';
export interface IPushSubscription {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    createdAt: Date;
}
export type IPushSubscriptionDocument = IPushSubscription & Document;
export declare const PushSubscription: Model<IPushSubscriptionDocument>;
