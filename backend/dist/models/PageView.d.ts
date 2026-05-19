import mongoose, { type Document, type Model } from 'mongoose';
export interface IPageView {
    _id: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    path: string;
    viewedAt: Date;
}
export type IPageViewDocument = IPageView & Document;
export declare const PageView: Model<IPageViewDocument>;
