import mongoose, { Schema } from 'mongoose';
const favoriteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    characterId: { type: Number, required: true },
    characterName: { type: String, required: true },
    characterData: { type: Schema.Types.Mixed, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
favoriteSchema.index({ userId: 1, characterId: 1 }, { unique: true });
export const Favorite = mongoose.models.Favorite ??
    mongoose.model('Favorite', favoriteSchema);
