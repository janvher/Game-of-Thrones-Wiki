import mongoose, { Schema, type Document, type Model } from 'mongoose';

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

const pushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscription: Model<IPushSubscriptionDocument> =
  mongoose.models.PushSubscription ??
  mongoose.model<IPushSubscriptionDocument>('PushSubscription', pushSubscriptionSchema);
