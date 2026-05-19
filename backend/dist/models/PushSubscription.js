import mongoose, { Schema } from 'mongoose';
const pushSubscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });
export const PushSubscription = mongoose.models.PushSubscription ??
    mongoose.model('PushSubscription', pushSubscriptionSchema);
