import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPageView {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  path: string;
  viewedAt: Date;
}

export type IPageViewDocument = IPageView & Document;

const pageViewSchema = new Schema<IPageViewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    path: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const PageView: Model<IPageViewDocument> =
  mongoose.models.PageView ??
  mongoose.model<IPageViewDocument>('PageView', pageViewSchema);
