import mongoose, { Schema } from 'mongoose';
const pageViewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    path: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now },
}, { timestamps: false });
export const PageView = mongoose.models.PageView ??
    mongoose.model('PageView', pageViewSchema);
